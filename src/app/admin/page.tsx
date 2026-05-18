'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertTriangle, CalendarOff } from 'lucide-react';
import styles from './page.module.css';

type Booking = {
  id: string;
  teamName: string;
  phone: string;
  date: string;
  slot: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'DUE' | 'CANCELLED' | 'BLOCKED';
};

const MOCK_BOOKINGS: Booking[] = [
  { id: '1', teamName: 'Mannar Strikers', phone: '+91 9876543210', date: '2026-05-16', slot: '18:00 - 19:00', amount: 800, status: 'DUE' },
  { id: '2', teamName: 'FC Kerala', phone: '+91 9123456780', date: '2026-05-18', slot: '06:00 - 08:00', amount: 800, status: 'PAID' },
  { id: '3', teamName: 'Neon Blasters', phone: '+91 9988776655', date: '2026-05-19', slot: '19:00 - 20:00', amount: 800, status: 'PENDING' },
];

const MONTHLY_REVENUE = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 75000 },
  { name: 'Jun', revenue: 69000 },
];

const YEARLY_REVENUE = [
  { name: '2022', revenue: 450000 },
  { name: '2023', revenue: 520000 },
  { name: '2024', revenue: 680000 },
  { name: '2025', revenue: 850000 },
  { name: '2026', revenue: 920000 }, // Projected
];

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [blockDate, setBlockDate] = useState('');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('Panchayath Event');

  const updateStatus = (id: string, newStatus: Booking['status']) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    if (booking.status === 'DUE' && newStatus === 'PAID') {
      const confirmClear = window.confirm(`WARNING: You are about to clear a DUE of ₹${booking.amount} for team ${booking.teamName}.\n\nAre you sure they have paid this amount? A clearance receipt/invoice will be sent to their WhatsApp.`);
      if (!confirmClear) return;
      alert(`Due cleared! Receipt message sent to ${booking.teamName}.`);
    }

    if (newStatus === 'DUE' && booking.status !== 'DUE') {
      const confirmNoShow = window.confirm(`Mark team ${booking.teamName} as a NO-SHOW?\n\nThis will apply a 50% penalty due (₹${booking.amount * 0.5}) to their account and send a penalty notice to their WhatsApp/Email.`);
      if (!confirmNoShow) return;
      alert(`No-show penalty applied! Penalty notice sent to ${booking.teamName}.`);
    }

    setBookings(bookings.map(b => {
      if (b.id === id) {
        let amount = b.amount;
        if (newStatus === 'DUE' && b.status !== 'DUE') amount = b.amount * 0.5;
        if (newStatus === 'CANCELLED') amount = 0;
        return { ...b, status: newStatus, amount };
      }
      return b;
    }));
  };

  const handleReschedule = (id: string) => {
    const newTime = prompt("Enter new time slot (e.g., 20:00 - 21:00):");
    if (newTime) {
      setBookings(bookings.map(b => b.id === id ? { ...b, slot: newTime } : b));
      alert("Booking rescheduled and team notified via WhatsApp/Email.");
    }
  };

  const handleBlockSlots = () => {
    if (!blockDate || !blockStart || !blockEnd) {
      alert("Please fill all fields to block slots.");
      return;
    }

    const confirmBlock = confirm(`Are you sure you want to block the turf on ${blockDate} from ${blockStart} to ${blockEnd} due to '${blockReason}'?\n\nThis will instantly CANCEL all overlapping bookings without prior notice.`);
    if (confirmBlock) {
      // Logic to bulk cancel overlapping bookings
      const updatedBookings = bookings.map(b => {
        if (b.date === blockDate && b.status !== 'CANCELLED' && b.status !== 'BLOCKED') {
          // Simple string match for demonstration
          if (b.slot.includes(blockStart) || b.slot.includes(blockEnd)) {
             return { ...b, status: 'CANCELLED' as Booking['status'], amount: 0 };
          }
        }
        return b;
      });
      
      // Add a blocked "dummy" booking to the list to show the block
      const blockedSlot: Booking = {
        id: `block-${Date.now()}`,
        teamName: `[BLOCKED] ${blockReason}`,
        phone: '-',
        date: blockDate,
        slot: `${blockStart} - ${blockEnd}`,
        amount: 0,
        status: 'BLOCKED'
      };

      setBookings([blockedSlot, ...updatedBookings]);
      alert(`Turf blocked successfully. Overlapping bookings cancelled. Teams have been notified.`);
      setBlockDate(''); setBlockStart(''); setBlockEnd('');
    }
  };

  return (
    <div className={styles.container}>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.header}
      >
        <h1 className={styles.title}>Admin Dashboard - EAST WELFARE TURF</h1>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={styles.statsGrid}
      >
        <div className={styles.statCard}>
          <h3>Total Bookings Today</h3>
          <p>12</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pending Dues</h3>
          <p style={{ color: '#FF4444' }}>₹400</p>
        </div>
        <div className={styles.statCard}>
          <h3>Revenue Collected (May)</h3>
          <p style={{ color: '#00E676' }}>₹75,000</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={styles.chartGrid}
      >
        <div className={styles.chartCard}>
          <h3>Monthly Revenue (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={MONTHLY_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#141416', borderColor: '#27272A', color: '#fff' }}
                itemStyle={{ color: '#00E676' }}
              />
              <Bar dataKey="revenue" fill="#00E676" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3>Yearly Revenue Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={YEARLY_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#141416', borderColor: '#27272A', color: '#fff' }}
                itemStyle={{ color: '#00E676' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#00E676" strokeWidth={3} dot={{ r: 6, fill: '#00E676' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={styles.section}
      >
        <h2 className={styles.sectionTitle}>
          Emergency Slot Blocking
          <CalendarOff size={24} color="#FF4444" />
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Instantly make the turf unavailable for unexpected Panchayath occasions or maintenance. Overlapping slots will be cancelled without notice.
        </p>
        <div className={styles.blockForm}>
          <div className={styles.inputGroup}>
            <label>Date</label>
            <input type="date" className={styles.inputField} value={blockDate} onChange={e => setBlockDate(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label>Start Time</label>
            <input type="time" className={styles.inputField} value={blockStart} onChange={e => setBlockStart(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label>End Time</label>
            <input type="time" className={styles.inputField} value={blockEnd} onChange={e => setBlockEnd(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label>Reason</label>
            <select className={styles.selectField} value={blockReason} onChange={e => setBlockReason(e.target.value)}>
              <option>Panchayath Event</option>
              <option>Maintenance</option>
              <option>Weather Condition</option>
              <option>Other</option>
            </select>
          </div>
          <button className={styles.blockBtn} onClick={handleBlockSlots}>Block Turf</button>
          
          <div className={styles.emergencyNotice}>
            <AlertTriangle size={16} /> Use with caution. This forces immediate cancellations.
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={styles.section}
      >
        <h2 className={styles.sectionTitle}>Manage Bookings & Dues</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Team Name</th>
                <th>WhatsApp Number</th>
                <th>Date & Slot</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} style={{ opacity: booking.status === 'CANCELLED' || booking.status === 'BLOCKED' ? 0.6 : 1 }}>
                  <td><strong>{booking.teamName}</strong></td>
                  <td>{booking.phone}</td>
                  <td>{booking.date} | {booking.slot}</td>
                  <td>₹{booking.amount}</td>
                  <td>
                    <span className={`${styles.badge} ${
                      booking.status === 'PAID' ? styles.paid : 
                      booking.status === 'DUE' ? styles.due : 
                      booking.status === 'CANCELLED' || booking.status === 'BLOCKED' ? styles.cancelled : 
                      styles.pending
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.status !== 'CANCELLED' && booking.status !== 'BLOCKED' && (
                      <div className={styles.actionBtnGroup}>
                        {booking.status !== 'PAID' && (
                          <button onClick={() => updateStatus(booking.id, 'PAID')} className={`${styles.actionBtn} ${styles.markPaid}`}>
                            Paid
                          </button>
                        )}
                        {booking.status === 'PENDING' && (
                          <button onClick={() => updateStatus(booking.id, 'DUE')} className={`${styles.actionBtn} ${styles.markDue}`} title="Mark 50% due for No-Show">
                            No-Show
                          </button>
                        )}
                        <button onClick={() => handleReschedule(booking.id)} className={`${styles.actionBtn} ${styles.reschedule}`}>
                          Reschedule
                        </button>
                        <button onClick={() => updateStatus(booking.id, 'CANCELLED')} className={`${styles.actionBtn} ${styles.cancel}`}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
