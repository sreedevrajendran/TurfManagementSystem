'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function BookPage() {
  const [dates] = useState(generateDates(14));
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duration, setDuration] = useState<number>(1);
  
  // Registration States
  const [teamName, setTeamName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Generate 24 slots, starting from 06:00 morning to 05:00 next day
  const slots = Array.from({ length: 24 }, (_, i) => (i + 6) % 24);

  const handleSlotClick = (hour: number) => {
    setSelectedSlot(hour);
    setDuration(1);
    setIsModalOpen(true);
  };

  const calculatePrice = (startHour: number, dur: number) => {
    let total = 0;
    for (let i = 0; i < dur; i++) {
      const h = (startHour + i) % 24;
      if (h >= 6 && h < 18) {
        total += 400; // Off-peak
      } else {
        total += 800; // Peak
      }
    }
    return total;
  };

  const handleConfirm = () => {
    if (!teamName || !phoneNumber) {
      alert("Please enter Team Name and Phone Number to register.");
      return;
    }
    
    if (selectedSlot !== null) {
      alert(`Booking Confirmed for Team ${teamName}!\nTime: ${formatTime(selectedSlot)} for ${duration} hour(s)\nTotal Payable at Venue: ₹${calculatePrice(selectedSlot, duration)}\n\nAn invoice and WhatsApp notification have been sent.`);
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
        <p className={styles.subtitle}>Select your preferred date and time to dominate the pitch.</p>
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
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 }
              }}
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
                <button
                  className={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button className={styles.confirmBtn} onClick={handleConfirm}>
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
