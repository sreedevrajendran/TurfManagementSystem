'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertTriangle, CalendarOff, Mail, Tag, RefreshCw } from 'lucide-react';
import styles from './page.module.css';
import LogoutButton from '@/components/LogoutButton';
import CustomModal from '@/components/CustomModal';

type Booking = {
  id: string;
  teamName: string;
  phone: string;
  date: string;
  startTime: number;
  durationHours: number;
  amount: number;
  status: 'PENDING' | 'PAID' | 'DUE' | 'CANCELLED' | 'BLOCKED';
  userEmail?: string;
};

type SpecialOffer = {
  id: string;
  title: string;
  description: string | null;
  discountPct: number;
  slotType: 'PEAK' | 'OFF_PEAK' | 'BOTH';
  startDate: string;
  endDate: string;
  active: boolean;
};

const formatHour = (hour: number) => {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:00 ${ampm}`;
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockDate, setBlockDate] = useState('');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('Panchayath Event');
  const [emailStatus, setEmailStatus] = useState('');
  const [dueAlertLoading, setDueAlertLoading] = useState(false);

  // Offers State
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('20');
  const [offerSlotType, setOfferSlotType] = useState('BOTH');
  const [offerStartDate, setOfferStartDate] = useState('');
  const [offerEndDate, setOfferEndDate] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);

  const [customModal, setCustomModal] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'success';
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: () => {} });

  const showAlert = (title: string, message: string, type: 'alert' | 'success' = 'alert', callback?: () => void) => {
    setCustomModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: () => {
        setCustomModal(prev => ({ ...prev, isOpen: false }));
        if (callback) callback();
      }
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setCustomModal({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        setCustomModal(prev => ({ ...prev, isOpen: false }));
        onConfirm();
      },
      onCancel: () => setCustomModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  // ── Fetch real bookings ──────────────────────────────────────────────────
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      const mapped = data.map((b: any) => ({
        id: b.id,
        teamName: b.team?.name || b.user?.name || 'Unknown',
        phone: b.team?.phone?.startsWith('USER-') ? b.user?.email || '—' : (b.team?.phone || '—'),
        date: new Date(b.date).toLocaleDateString('en-IN'),
        startTime: b.startTime,
        durationHours: b.durationHours,
        amount: b.amount,
        status: b.status,
        userEmail: b.user?.email,
      }));
      setBookings(mapped);
    } catch {
      console.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/admin/offers');
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch (e) {
      console.error('Failed to fetch offers:', e);
    }
  };

  useEffect(() => { 
    fetchBookings(); 
    fetchOffers();
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────
  const todayStr = new Date().toLocaleDateString('en-IN');
  const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'CANCELLED').length;
  const totalDue = bookings.filter(b => b.status === 'DUE').reduce((s, b) => s + b.amount, 0);
  const totalPaidThisMonth = bookings
    .filter(b => b.status === 'PAID')
    .reduce((s, b) => s + b.amount, 0);

  // ── Actions ──────────────────────────────────────────────────────────────
  const markPaid = async (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    showConfirm('Mark as Paid?', `Mark ₹${booking.amount} as PAID for ${booking.teamName}? A thank-you email will be sent.`, async () => {
      const res = await fetch('/api/admin/mark-paid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: id }) });
      if (res.ok) { await fetchBookings(); showAlert('Success', 'Marked as paid ✅ Thank-you email sent!', 'success'); }
    });
  };

  const markNoShow = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    showConfirm('Mark as No-Show?', `Apply a 50% penalty (₹${booking.amount * 0.5}) for ${booking.teamName}?`, () => {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'DUE', amount: b.amount * 0.5 } : b));
      showAlert('Applied', 'No-show penalty applied!', 'success');
    });
  };

  const cancelBooking = (id: string) => {
    showConfirm('Cancel Booking?', 'Are you sure you want to cancel this booking?', () => {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'CANCELLED', amount: 0 } : b));
    });
  };

  const handleBlockSlots = () => {
    if (!blockDate || !blockStart || !blockEnd) { showAlert('Missing Fields', 'Please fill all fields.'); return; }
    showConfirm('Block Turf?', `Block turf on ${blockDate} from ${blockStart} to ${blockEnd}?\nReason: ${blockReason}\n\nThis will cancel overlapping bookings.`, () => {
      setBookings(prev => {
        const updated = prev.map(b => {
          if (b.date === new Date(blockDate).toLocaleDateString('en-IN') && b.status !== 'CANCELLED' && b.status !== 'BLOCKED') {
            return { ...b, status: 'CANCELLED' as Booking['status'], amount: 0 };
          }
          return b;
        });
        return [{ id: `block-${Date.now()}`, teamName: `[BLOCKED] ${blockReason}`, phone: '—', date: new Date(blockDate).toLocaleDateString('en-IN'), startTime: parseInt(blockStart), durationHours: 1, amount: 0, status: 'BLOCKED' as Booking['status'] }, ...updated];
      });
      showAlert('Blocked', 'Turf blocked. Overlapping bookings cancelled.', 'success');
      setBlockDate(''); setBlockStart(''); setBlockEnd('');
    });
  };

  const sendDueAlerts = async () => {
    setDueAlertLoading(true);
    setEmailStatus('Sending...');
    const res = await fetch('/api/admin/send-due-alerts', { method: 'POST' });
    const data = await res.json();
    setEmailStatus(`✅ Sent ${data.sent} due alert email(s)!`);
    setDueAlertLoading(false);
  };

  const handleCreateOffer = async () => {
    if (!offerTitle || !offerDiscount || !offerStartDate || !offerEndDate) {
      showAlert('Missing Fields', 'Please fill out all required offer fields.');
      return;
    }
    setOfferLoading(true);
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: offerTitle,
          description: offerDesc,
          discountPct: Number(offerDiscount),
          slotType: offerSlotType,
          startDate: offerStartDate,
          endDate: offerEndDate,
        })
      });
      if (res.ok) {
        showAlert('Success', 'Special offer created successfully!', 'success');
        setOfferTitle('');
        setOfferDesc('');
        setOfferDiscount('20');
        setOfferStartDate('');
        setOfferEndDate('');
        fetchOffers();
      }
    } catch (e) {
      console.error(e);
      showAlert('Error', 'Failed to create offer.');
    } finally {
      setOfferLoading(false);
    }
  };

  const toggleOffer = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive })
      });
      if (res.ok) fetchOffers();
    } catch (e) {
      console.error('Failed to toggle offer:', e);
    }
  };

  const deleteOffer = async (id: string) => {
    showConfirm('Delete Offer?', 'Are you sure you want to delete this offer?', async () => {
      try {
        const res = await fetch('/api/admin/offers', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        if (res.ok) fetchOffers();
      } catch (e) {
        console.error('Failed to delete offer:', e);
      }
    });
  };

  const sendOfferEmail = async (id: string) => {
    showConfirm('Send Mass Email?', 'This will email ALL registered users about this offer. Are you sure?', async () => {
      try {
        setEmailStatus('Sending offer emails...');
        const res = await fetch('/api/admin/send-offer-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId: id })
        });
        const data = await res.json();
        setEmailStatus(`✅ Sent special offer to ${data.sent} user(s)!`);
      } catch (e) {
        console.error('Failed to send offer emails:', e);
        setEmailStatus('❌ Failed to send emails.');
      }
    });
  };

  return (
    <div className={styles.container}>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.header}
      >
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            East Welfare Turf · Mannar · +91 97785 18909
          </p>
        </div>
        <LogoutButton />
      </motion.header>

      {/* ── STATS ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Bookings Today</h3>
          <p>{loading ? '...' : todayBookings}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Pending Dues</h3>
          <p style={{ color: '#FF4444' }}>{loading ? '...' : `₹${totalDue.toLocaleString('en-IN')}`}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Revenue Collected</h3>
          <p style={{ color: '#00E676' }}>{loading ? '...' : `₹${totalPaidThisMonth.toLocaleString('en-IN')}`}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Bookings</h3>
          <p>{loading ? '...' : bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'BLOCKED').length}</p>
        </div>
      </motion.div>

      {/* ── EMAIL ACTIONS ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={styles.section}
      >
        <h2 className={styles.sectionTitle}>
          Email Actions <Mail size={22} color="#00b0ff" />
        </h2>
        <div className={styles.emailActionGrid}>
          <div className={styles.emailActionCard}>
            <h4>Due Payment Reminders</h4>
            <p>Send reminder emails to all users with pending dues.</p>
            <button className={styles.emailBtn} onClick={sendDueAlerts} disabled={dueAlertLoading}>
              {dueAlertLoading ? 'Sending...' : '📧 Send Due Alerts'}
            </button>
          </div>
        </div>
        {emailStatus && <p style={{ marginTop: 16, color: '#00E676' }}>{emailStatus}</p>}
      </motion.section>

      {/* ── SPECIAL OFFERS ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className={styles.section}
      >
        <h2 className={styles.sectionTitle}>
          Special Offers & Discounts <Tag size={24} color="#FFD700" />
        </h2>
        
        <div className={styles.blockForm} style={{ background: 'rgba(255, 215, 0, 0.05)', borderColor: 'rgba(255, 215, 0, 0.2)' }}>
          <div className={styles.inputGroup}>
            <label>Offer Title</label>
            <input type="text" className={styles.inputField} placeholder="e.g. Weekend Madness" value={offerTitle} onChange={e => setOfferTitle(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label>Discount %</label>
            <input type="number" className={styles.inputField} value={offerDiscount} onChange={e => setOfferDiscount(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label>Slot Type</label>
            <select className={styles.selectField} value={offerSlotType} onChange={e => setOfferSlotType(e.target.value)}>
              <option value="BOTH">All Slots</option>
              <option value="PEAK">Peak Only (6pm-6am)</option>
              <option value="OFF_PEAK">Off-Peak Only (6am-6pm)</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Start Date</label>
            <input type="date" className={styles.inputField} value={offerStartDate} onChange={e => setOfferStartDate(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label>End Date</label>
            <input type="date" className={styles.inputField} value={offerEndDate} onChange={e => setOfferEndDate(e.target.value)} />
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Description (Optional)</label>
            <input type="text" className={styles.inputField} placeholder="Additional details..." value={offerDesc} onChange={e => setOfferDesc(e.target.value)} />
          </div>
          <button 
            className={styles.blockBtn} 
            style={{ background: '#FFD700', color: '#000' }} 
            onClick={handleCreateOffer}
            disabled={offerLoading}
          >
            {offerLoading ? 'Creating...' : 'Create Offer'}
          </button>
        </div>

        {/* Offers List */}
        {offers.length > 0 && (
          <div className={styles.tableContainer} style={{ marginTop: 24 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Discount</th>
                  <th>Applies To</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(offer => (
                  <tr key={offer.id} style={{ opacity: offer.active ? 1 : 0.6 }}>
                    <td><strong>{offer.title}</strong></td>
                    <td style={{ color: '#FFD700', fontWeight: 'bold' }}>{offer.discountPct}% OFF</td>
                    <td>{offer.slotType === 'BOTH' ? 'All Slots' : offer.slotType === 'PEAK' ? 'Peak' : 'Off-Peak'}</td>
                    <td>{new Date(offer.endDate).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`${styles.badge} ${offer.active ? styles.paid : styles.cancelled}`}>
                        {offer.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtnGroup}>
                        <button onClick={() => toggleOffer(offer.id, offer.active)} className={`${styles.actionBtn} ${styles.reschedule}`}>
                          {offer.active ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => sendOfferEmail(offer.id)} className={`${styles.actionBtn} ${styles.markPaid}`}>
                          Email Users
                        </button>
                        <button onClick={() => deleteOffer(offer.id)} className={`${styles.actionBtn} ${styles.cancel}`}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>

      {/* ── EMERGENCY BLOCKING ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={styles.section}
      >
        <h2 className={styles.sectionTitle}>
          Emergency Slot Blocking <CalendarOff size={24} color="#FF4444" />
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Block the turf for Panchayath events, maintenance, or weather. Overlapping bookings will be cancelled.
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

      {/* ── BOOKINGS TABLE ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={styles.section}
      >
        <h2 className={styles.sectionTitle}>
          All Bookings
          <button onClick={fetchBookings} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <RefreshCw size={18} />
          </button>
        </h2>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No bookings yet. They'll appear here once users start booking.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Team / User</th>
                  <th>Contact</th>
                  <th>Date & Slot</th>
                  <th>Amount (₹)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} style={{ opacity: booking.status === 'CANCELLED' || booking.status === 'BLOCKED' ? 0.5 : 1 }}>
                    <td><strong>{booking.teamName}</strong></td>
                    <td style={{ fontSize: '0.85rem' }}>{booking.phone}</td>
                    <td>{booking.date} | {formatHour(booking.startTime)}–{formatHour((booking.startTime + booking.durationHours) % 24)}</td>
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
                            <button onClick={() => markPaid(booking.id)} className={`${styles.actionBtn} ${styles.markPaid}`}>
                              ✅ Paid
                            </button>
                          )}
                          {booking.status === 'PENDING' && (
                            <button onClick={() => markNoShow(booking.id)} className={`${styles.actionBtn} ${styles.markDue}`}>
                              No-Show
                            </button>
                          )}
                          <button onClick={() => cancelBooking(booking.id)} className={`${styles.actionBtn} ${styles.cancel}`}>
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
        )}
      </motion.section>
      <CustomModal {...customModal} />
    </div>
  );
}
