'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, ShieldCheck, Tag } from 'lucide-react';
import styles from './page.module.css';

type SpecialOffer = {
  id: string;
  title: string;
  discountPct: number;
  slotType: 'PEAK' | 'OFF_PEAK' | 'BOTH';
  startDate: string;
  endDate: string;
};

const generateDates = (days: number) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const formatTime = (hour: number) => {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:00 ${ampm}`;
};

export default function BookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [dates] = useState(generateDates(14));
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duration, setDuration] = useState<number>(1);
  const [teamName, setTeamName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [offers, setOffers] = useState<SpecialOffer[]>([]);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  // Pre-fill team name for regular users
  useEffect(() => {
    if (session?.user?.name && !isAdmin) {
      setTeamName(session.user.name);
    }
  }, [session, isAdmin]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch('/api/offers');
        if (res.ok) setOffers(await res.json());
      } catch (e) {
        console.error('Failed to fetch offers:', e);
      }
    };
    fetchOffers();
  }, []);

  const slots = Array.from({ length: 24 }, (_, i) => (i + 6) % 24);

  const handleSlotClick = (hour: number) => {
    if (status === 'unauthenticated') {
      signIn('google', { callbackUrl: '/book' });
      return;
    }
    setSelectedSlot(hour);
    setDuration(1);
    setIsModalOpen(true);
  };

  const getPriceForHour = (hour: number, date: Date) => {
    const isOffPeak = hour >= 6 && hour < 18;
    const basePrice = isOffPeak ? 400 : 800;
    const slotType = isOffPeak ? 'OFF_PEAK' : 'PEAK';

    // Find the best applicable offer
    let bestDiscount = 0;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    for (const offer of offers) {
      const start = new Date(offer.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(offer.endDate);
      end.setHours(23, 59, 59, 999);

      if (checkDate >= start && checkDate <= end) {
        if (offer.slotType === 'BOTH' || offer.slotType === slotType) {
          if (offer.discountPct > bestDiscount) bestDiscount = offer.discountPct;
        }
      }
    }

    const finalPrice = basePrice - (basePrice * (bestDiscount / 100));
    return { basePrice, finalPrice, discount: bestDiscount };
  };

  const calculateTotal = (startHour: number, dur: number, date: Date) => {
    let totalBase = 0;
    let totalFinal = 0;
    for (let i = 0; i < dur; i++) {
      const h = (startHour + i) % 24;
      const { basePrice, finalPrice } = getPriceForHour(h, date);
      totalBase += basePrice;
      totalFinal += finalPrice;
    }
    return { totalBase, totalFinal };
  };

  const handleConfirm = async () => {
    if (!teamName.trim()) {
      alert('Please enter a Team Name.');
      return;
    }
    if (isAdmin && !phoneNumber.trim()) {
      alert('Please enter the team\'s WhatsApp number.');
      return;
    }

    if (selectedSlot === null) return;
    setIsLoading(true);

    try {
      const { totalFinal } = calculateTotal(selectedSlot, duration, selectedDate);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          startTime: selectedSlot,
          durationHours: duration,
          teamName: teamName.trim(),
          phone: phoneNumber.trim(),
          amount: totalFinal,
        }),
      });

      if (res.ok) {
        alert(`✅ Booking Confirmed for "${teamName}"!\nTime: ${formatTime(selectedSlot)} for ${duration} hour(s)\nTotal: ₹${totalFinal}\n\nPay at the venue.`);
        setIsModalOpen(false);
        setSelectedSlot(null);
        if (isAdmin) { setTeamName(''); setPhoneNumber(''); }
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Booking failed: ${err.error || 'Unknown error'}`);
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show login prompt if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className={styles.container}>
        <div className={styles.loginPrompt}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.loginCard}
          >
            <LogIn size={56} color="var(--primary-accent)" />
            <h2>Sign In to Book</h2>
            <p>You need to sign in with Google to book a turf slot.</p>
            <button
              onClick={() => signIn('google', { callbackUrl: '/book' })}
              className={styles.googleBtn}
            >
              <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign In with Google
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.header}
      >
        <h1 className={styles.title}>EAST WELFARE TURF</h1>
        <p className={styles.subtitle}>
          {isAdmin
            ? '🛡️ Admin Booking — Enter team details to register a slot.'
            : `Welcome, ${session?.user?.name?.split(' ')[0]}! Select your date and time.`}
        </p>
        {isAdmin && (
          <div className={styles.adminBadge}>
            <ShieldCheck size={16} /> Admin Mode
          </div>
        )}
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className={styles.dateScroll}
      >
        {dates.map((date, idx) => (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={idx}
            className={`${styles.dateCard} ${selectedDate.toDateString() === date.toDateString() ? styles.selected : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            <div className={styles.dateDay}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className={styles.dateNumber}>{date.getDate()}</div>
            <div className={styles.dateDay}>{date.toLocaleDateString('en-US', { month: 'short' })}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
        }}
        className={styles.slotsGrid}
      >
        {slots.map((hour) => {
          const now = new Date();
          const isToday = selectedDate.toDateString() === now.toDateString();
          // Disable slot if it's today and the hour has already passed (including current hour)
          const isPast = isToday && hour <= now.getHours();
          const isBooked = hour === 19 || hour === 20;
          const isDisabled = isPast || isBooked;
          const isOffPeak = hour >= 6 && hour < 18;
          const isCurrentHour = isToday && hour === now.getHours();
          const { basePrice, finalPrice, discount } = getPriceForHour(hour, selectedDate);
          const hasDiscount = discount > 0;

          return (
            <motion.div
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
              key={hour}
              onClick={() => !isDisabled && handleSlotClick(hour)}
              className={`${styles.slot} ${
                isPast ? styles.past
                : isBooked ? styles.booked
                : styles.available
              }`}
              title={isPast ? 'This slot has already passed' : isBooked ? 'Already booked' : hasDiscount ? `${discount}% OFF Special Offer!` : ''}
            >
              <div>{formatTime(hour)}</div>
              {isCurrentHour
                ? <div className={styles.nowTag}>NOW</div>
                : isPast
                  ? <div className={styles.priceTag}>Past</div>
                  : (
                    <div className={styles.priceTag} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {hasDiscount ? (
                        <>
                          <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.7rem' }}>₹{basePrice}</span>
                          <span style={{ color: '#FFD700', fontWeight: 'bold' }}>₹{finalPrice} <Tag size={10} /></span>
                        </>
                      ) : (
                        `₹${basePrice}`
                      )}
                    </div>
                  )
              }
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={styles.modal}
            >
              <h2 className={styles.modalTitle}>Book Slot</h2>

              {/* Team name — admin can edit, user sees their name pre-filled */}
              <div className={styles.inputGroup}>
                <label>Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mannar Strikers"
                  className={styles.inputField}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  readOnly={!isAdmin && !!session?.user?.name}
                />
              </div>

              {/* Phone — only required for admin bookings */}
              {isAdmin && (
                <div className={styles.inputGroup}>
                  <label>Team WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    className={styles.inputField}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              )}

              <div className={styles.inputGroup}>
                <label>Duration</label>
                <select
                  className={styles.durationSelect}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  <option value={1}>1 Hour ({formatTime(selectedSlot!)} – {formatTime((selectedSlot! + 1) % 24)})</option>
                  <option value={2}>2 Hours ({formatTime(selectedSlot!)} – {formatTime((selectedSlot! + 2) % 24)})</option>
                  <option value={3}>3 Hours ({formatTime(selectedSlot!)} – {formatTime((selectedSlot! + 3) % 24)})</option>
                </select>
              </div>

              <div className={styles.totalSection}>
                <span>Total Amount:</span>
                <strong>₹{selectedSlot !== null && calculateTotal(selectedSlot, duration, selectedDate).totalFinal}</strong>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className={styles.confirmBtn} onClick={handleConfirm} disabled={isLoading}>
                  {isLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
