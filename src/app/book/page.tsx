'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { LogIn, Lock, CalendarCheck } from 'lucide-react';
import styles from './page.module.css';

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
  return `${hour.toString().padStart(2, '0')}:00`;
};

// ─── Sign-in Gate ────────────────────────────────────────────────────────────
function SignInGate() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '3rem',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{
          width: '80px', height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00E676 0%, #1de9b6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Lock size={36} color="#000" />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
          Sign In to Book
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Create your account or sign in with Google to access real-time slot availability and book your turf instantly.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => signIn('google', { callbackUrl: '/book' })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '14px 24px',
              background: '#fff',
              color: '#111',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <CalendarCheck size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Instant booking confirmation after sign-in
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Booking Page ────────────────────────────────────────────────────────
export default function BookPage() {
  const { data: session, status } = useSession();

  const [dates] = useState(generateDates(14));
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duration, setDuration] = useState<number>(1);
  const [teamName, setTeamName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const slots = Array.from({ length: 24 }, (_, i) => (i + 6) % 24);

  // Show gate for unauthenticated users
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <CalendarCheck size={40} color="var(--primary-accent)" />
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return <SignInGate />;
  }

  const handleSlotClick = (hour: number) => {
    setSelectedSlot(hour);
    setDuration(1);
    setIsModalOpen(true);
  };

  const calculatePrice = (startHour: number, dur: number) => {
    let total = 0;
    for (let i = 0; i < dur; i++) {
      const h = (startHour + i) % 24;
      total += (h >= 6 && h < 18) ? 400 : 800;
    }
    return total;
  };

  const handleConfirm = () => {
    if (!teamName || !phoneNumber) {
      alert("Please enter Team Name and Phone Number.");
      return;
    }
    if (selectedSlot !== null) {
      alert(`Booking Confirmed for Team ${teamName}!\nTime: ${formatTime(selectedSlot)} for ${duration} hour(s)\nTotal: ₹${calculatePrice(selectedSlot, duration)}\n\nThank you, ${session.user?.name}!`);
      setIsModalOpen(false);
      setSelectedSlot(null);
      setTeamName('');
      setPhoneNumber('');
    }
  };

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
          Welcome, <strong style={{ color: 'var(--primary-accent)' }}>{session.user?.name}</strong>! Select your preferred date and time.
        </p>
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
          const isBooked = hour === 19 || hour === 20;
          const isOffPeak = hour >= 6 && hour < 18;
          return (
            <motion.div
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
              key={hour}
              onClick={() => !isBooked && handleSlotClick(hour)}
              className={`${styles.slot} ${isBooked ? styles.booked : styles.available}`}
            >
              <div>{formatTime(hour)}</div>
              <div className={styles.priceTag}>₹{isOffPeak ? '400' : '800'}</div>
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
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={styles.modal}
            >
              <h2 className={styles.modalTitle}>Book Slot</h2>

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
                <label>WhatsApp Number</label>
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
                  <option value={1}>1 Hour ({formatTime(selectedSlot!)} - {formatTime((selectedSlot! + 1) % 24)})</option>
                  <option value={2}>2 Hours ({formatTime(selectedSlot!)} - {formatTime((selectedSlot! + 2) % 24)})</option>
                  <option value={3}>3 Hours</option>
                </select>
              </div>

              <div className={styles.totalSection}>
                <span>Total Amount:</span>
                <strong>₹{selectedSlot !== null && calculatePrice(selectedSlot, duration)}</strong>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className={styles.confirmBtn} onClick={handleConfirm}>
                  <LogIn size={16} style={{ marginRight: 6 }} /> Confirm Booking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
