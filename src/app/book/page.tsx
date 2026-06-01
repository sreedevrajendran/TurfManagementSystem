'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, ShieldCheck, Tag } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import CustomModal from '@/components/CustomModal';
import { generateReceiptImage } from '@/lib/generateReceipt';

type SpecialOffer = {
  id: string;
  title: string;
  discountPct: number;
  fixedPrice: number | null;
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

  const [dates, setDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  useEffect(() => {
    const generated = generateDates(3);
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        // Add to array if not present in the next 3 days
        if (!generated.some(d => d.toDateString() === parsed.toDateString())) {
          generated.push(parsed);
          generated.sort((a, b) => a.getTime() - b.getTime());
        }
        setSelectedDate(parsed);
      }
    } else {
      setSelectedDate(generated[0]);
    }
    setDates(generated);
  }, []);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duration, setDuration] = useState<number>(1);
  const [sport, setSport] = useState<'FOOTBALL' | 'CRICKET'>('FOOTBALL');
  const [teamName, setTeamName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [customModal, setCustomModal] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'success';
    title: string;
    message: string;
    onConfirm: () => void;
    children?: React.ReactNode;
  }>({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: () => {} });

  const [pricing, setPricing] = useState({ offPeak: 800, peak: 1100, peakStart: 19 });

  useEffect(() => {
    fetch('/api/pricing').then(r => r.json()).then(p => { if(p) setPricing(p); }).catch(() => {});
  }, []);

  const showAlert = (title: string, message: string, type: 'alert' | 'success' = 'alert', callback?: () => void, children?: React.ReactNode) => {
    setCustomModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: () => {
        setCustomModal(prev => ({ ...prev, isOpen: false }));
        if (callback) callback();
      },
      children
    });
  };

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // User can now type their own team name and contact
  useEffect(() => {
    // Removed autofill
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

  useEffect(() => {
    const fetchBookedSlots = async () => {
      setIsFetchingSlots(true);
      try {
        const dateStr = selectedDate.toISOString();
        const res = await fetch(`/api/bookings?date=${encodeURIComponent(dateStr)}`);
        if (res.ok) {
          const data = await res.json();
          setBookedSlots(data);
        }
      } catch (e) {
        console.error('Failed to fetch booked slots:', e);
      } finally {
        setIsFetchingSlots(false);
      }
    };
    fetchBookedSlots();
    fetch('/api/blocks').then(r => r.json()).then(setBlocks).catch(() => {});
  }, [selectedDate]);

  const slots = Array.from({ length: 24 }, (_, i) => (i + 6) % 24);

  const handleSlotClick = (hour: number) => {
    if (status === 'unauthenticated') {
      signIn('google', { callbackUrl: '/book' });
      return;
    }
    setSelectedSlot(hour);
    setDuration(1);
    setSport('FOOTBALL');
    setIsModalOpen(true);
  };

  const getPriceForHour = (hour: number, date: Date) => {
    const isOffPeak = hour >= 6 && hour < pricing.peakStart;
    const basePrice = isOffPeak ? pricing.offPeak : pricing.peak;
    const slotType = isOffPeak ? 'OFF_PEAK' : 'PEAK';

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Find best applicable offer (fixed price takes priority over % discount)
    let bestFixedPrice: number | null = null;
    let bestDiscount = 0;

    for (const offer of offers) {
      const start = new Date(offer.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(offer.endDate);
      end.setHours(23, 59, 59, 999);

      if (checkDate >= start && checkDate <= end) {
        if (offer.slotType === 'BOTH' || offer.slotType === slotType) {
          if (offer.fixedPrice !== null && offer.fixedPrice !== undefined) {
            // Pick the lowest fixed price
            if (bestFixedPrice === null || offer.fixedPrice < bestFixedPrice) {
              bestFixedPrice = offer.fixedPrice;
            }
          } else if (offer.discountPct > bestDiscount) {
            bestDiscount = offer.discountPct;
          }
        }
      }
    }

    const finalPrice = bestFixedPrice !== null
      ? bestFixedPrice
      : basePrice - (basePrice * (bestDiscount / 100));
    return { basePrice, finalPrice, discount: bestDiscount, fixedPrice: bestFixedPrice };
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
      showAlert('Missing Info', 'Please enter a Team Name.');
      return;
    }
    if (!phoneNumber.trim()) {
      showAlert('Missing Info', 'Please enter the team\'s WhatsApp number.');
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
          sport,
        }),
      });

      if (res.ok) {
        const receiptData = {
          teamName,
          sport: sport === 'CRICKET' ? 'Cricket' : 'Football',
          date: selectedDate.toLocaleDateString('en-IN'),
          time: `${formatTime(selectedSlot)} – ${formatTime((selectedSlot + duration) % 24)}`,
          duration,
          phone: phoneNumber,
          amount: totalFinal,
        };

        const handleDownloadReceipt = () => {
          const dataUrl = generateReceiptImage(receiptData);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `EastWelfareTurf_Receipt_${teamName.replace(/\s+/g, '_')}_${Date.now()}.png`;
          a.click();
        };

        const handleShareReceipt = async () => {
          const dataUrl = generateReceiptImage(receiptData);
          // Convert data URL to blob for native share
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], `Receipt_${teamName}_${Date.now()}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: 'Booking Receipt' }).catch(() => {});
          } else {
            // Fallback: share text via WhatsApp
            const text = `*East Welfare Turf Booking*\nTeam: ${teamName}\nDate: ${receiptData.date}\nTime: ${receiptData.time}\nTotal: \u20b9${totalFinal}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
          }
        };

        showAlert(
          'Booking Confirmed!', 
          `Team: ${teamName}\nSport: ${sport === 'CRICKET' ? 'Cricket' : 'Football'}\nTime: ${formatTime(selectedSlot)} for ${duration} hour(s)\nTotal: ₹${totalFinal}\n\nPay at the venue.`,
          'success',
          () => {
            setIsModalOpen(false);
            setSelectedSlot(null);
            setTeamName(''); setPhoneNumber('');
            
            fetch(`/api/bookings?date=${encodeURIComponent(selectedDate.toISOString())}`)
              .then(r => r.json())
              .then(data => setBookedSlots(data))
              .catch(console.error);
              
            router.refresh();
          },
          (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleDownloadReceipt} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>📥 Download</button>
              <button onClick={handleShareReceipt} style={{ padding: '8px 16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>📱 Share</button>
            </div>
          )
        );
      } else {
        const err = await res.json();
        showAlert('Booking Failed', err.error || 'Unknown error occurred.');
      }
    } catch {
      showAlert('Network Error', 'Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 className={styles.title} style={{ cursor: 'pointer' }}>EAST WELFARE TURF</h1>
        </Link>
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
          visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
        }}
        className={styles.slotsGrid}
        style={isMobile ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        } : undefined}
      >
        {slots.map((hour) => {
          const now = new Date();
          const isToday = selectedDate.toDateString() === now.toDateString();
          const isPast = isToday && hour < now.getHours();
          const isCurrentHour = isToday && hour === now.getHours();
          
          const blockingBlock = blocks.find((b: any) => {
            if (new Date(b.date).toDateString() !== selectedDate.toDateString()) return false;
            if (b.durationHours === 24) return true;
            return hour >= b.startTime && hour < (b.startTime + b.durationHours);
          });
          const isBlocked = !!blockingBlock;
          
          const isBooked = bookedSlots.includes(hour) || isBlocked;
          const isDisabled = isPast || isBooked || isFetchingSlots;
          const { basePrice, finalPrice, discount, fixedPrice: slotFixedPrice } = getPriceForHour(hour, selectedDate);
          const hasDiscount = discount > 0;
          const hasFixedPrice = slotFixedPrice !== null && slotFixedPrice !== undefined;

          // Skip past slots entirely — no dark empty boxes
          if (isPast) return null;

          return (
            <motion.div
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
              key={hour}
              onClick={() => !isDisabled && handleSlotClick(hour)}
              className={`${styles.slot} ${
                isFetchingSlots ? styles.fetching : isBooked ? styles.booked : styles.available
              }`}
              style={isMobile ? {
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px 4px',
                fontSize: '0.8rem',
                minHeight: '52px',
                borderRadius: '8px',
                textAlign: 'center',
              } : undefined}
              title={isBlocked ? `Locked: ${blockingBlock.reason}` : isBooked ? 'Already booked' : hasFixedPrice ? `Special Price ₹${slotFixedPrice}/hr!` : hasDiscount ? `${discount}% OFF!` : ''}                                 
            >
              <span>{formatTime(hour)}</span>
              {isCurrentHour ? (
                <div className={styles.nowTag}>NOW</div>
              ) : isBlocked ? (
                <div className={styles.priceTag} style={{ color: '#FF6B6B', fontSize: '0.65rem', lineHeight: 1.1, textAlign: 'center' }}>
                  🔒<br/>Locked
                </div>
              ) : isBooked ? (
                <div className={styles.priceTag} style={{ color: '#FF4444' }}>✕</div>
              ) : hasFixedPrice ? (
                <div className={styles.priceTag} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontSize: '0.6rem' }}>₹{basePrice}</span>
                  <span style={{ color: '#00E676', fontWeight: 800 }}>₹{slotFixedPrice}</span>
                </div>
              ) : hasDiscount ? (
                <div className={styles.priceTag} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontSize: '0.6rem' }}>₹{basePrice}</span>
                  <span style={{ color: '#FFD700', fontWeight: 800 }}>₹{finalPrice}</span>
                </div>
              ) : (
                <div className={styles.priceTag}>₹{basePrice}</div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* BookMyShow-style legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 20, marginBottom: 8, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 16, borderRadius: 3, background: 'var(--slot-available-bg)', border: '2px solid var(--primary-accent)', display: 'inline-block' }} />
          Available
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 16, borderRadius: 3, background: 'var(--bg-surface)', border: '1px dashed var(--border-color)', opacity: 0.6, display: 'inline-block' }} />
          Booked
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 16, borderRadius: 3, background: '#0f0f12', border: '1px solid #1e1e28', display: 'inline-block' }} />
          Past
        </span>
      </div>

      {/* Portal-based bottom sheet — renders directly to document.body so
          it's never clipped/hidden by parent transforms or overflow */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                zIndex: 9999,
              }}
              onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
            >
              <motion.div
                key="sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                style={{
                  background: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '22px 22px 0 0',
                  padding: '16px 20px 40px',
                  width: '100%',
                  maxWidth: 500,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
                }}
              >
                {/* drag handle */}
                <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 4, margin: '0 auto 20px' }} />
                <h2 className={styles.modalTitle}>Book Slot</h2>

                <div className={styles.inputGroup}>
                  <label>Sport</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                      onClick={() => setSport('FOOTBALL')}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: sport === 'FOOTBALL' ? '2px solid #00e676' : '1px solid var(--border-color)', background: sport === 'FOOTBALL' ? 'rgba(0,230,118,0.1)' : 'transparent', color: '#fff', cursor: 'pointer' }}>
                      ⚽ Football
                    </button>
                    <button 
                      onClick={() => setSport('CRICKET')}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: sport === 'CRICKET' ? '2px solid #00b0ff' : '1px solid var(--border-color)', background: sport === 'CRICKET' ? 'rgba(0,176,255,0.1)' : 'transparent', color: '#fff', cursor: 'pointer' }}>
                      🏏 Cricket
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Team Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mannar Strikers"
                    className={styles.inputField}
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    {selectedSlot !== null && (() => {
                      const { totalBase, totalFinal } = calculateTotal(selectedSlot, duration, selectedDate);
                      const hasOffer = totalFinal < totalBase;
                      return (
                        <>
                          {hasOffer && (
                            <span style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontSize: '0.85rem' }}>₹{totalBase}</span>
                          )}
                          <strong style={{ color: hasOffer ? '#FFD700' : 'var(--primary-accent)', fontSize: '1.2rem' }}>₹{totalFinal}</strong>
                          {hasOffer && (
                            <span style={{ color: '#00E676', fontSize: '0.72rem', fontWeight: 600 }}>Offer applied 🎉</span>
                          )}
                        </>
                      );
                    })()}
                  </div>
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
        </AnimatePresence>,
        document.body
      )}

      <CustomModal {...customModal} />
    </div>
  );
}
