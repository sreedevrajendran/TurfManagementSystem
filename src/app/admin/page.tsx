'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Link from 'next/link';
import { AlertTriangle, CalendarOff, Mail, Tag, RefreshCw, Home, Users } from 'lucide-react';
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
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('Panchayath Event');
  const [activeBlocks, setActiveBlocks] = useState<any[]>([]);
  const [editingBlock, setEditingBlock] = useState<{ id: string; reason: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [emailStatus, setEmailStatus] = useState('');
  const [dueAlertLoading, setDueAlertLoading] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'DUE' | 'PAID' | 'CANCELLED' | 'NO_SHOW'>('ALL');
  const tableRef = useRef<HTMLElement>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'bookings' | 'users'>('overview');

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
  const fetchBookings = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
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
      setLastUpdated(new Date());
      setSecondsAgo(0);
    } catch {
      console.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
  };

  useEffect(() => {
    // Initial load
    fetchBookings();
    fetchOffers();
    fetchUsers();
    fetchActiveBlocks();

    // Auto-poll every 30 seconds (silent background refresh)
    const pollInterval = setInterval(() => fetchBookings(true), 30_000);

    // Refresh immediately when admin returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchBookings(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Live "Xs ago" counter
    const ticker = setInterval(() => setSecondsAgo(s => s + 1), 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(ticker);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatCardClick = (type: 'ALL' | 'TODAY' | 'DUE' | 'PAID') => {
    setActiveTab('bookings');
    setFilterType(type as any);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

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

  const markNoShow = async (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    showConfirm('Mark as No-Show?', `Apply a 50% penalty (₹${booking.amount * 0.5}) for ${booking.teamName}?`, async () => {
      const res = await fetch('/api/admin/mark-no-show', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: id }) });
      if (res.ok) { await fetchBookings(); showAlert('Applied', 'No-show penalty applied & email sent!', 'success'); }
      else { showAlert('Error', 'Failed to apply no-show penalty.'); }
    });
  };

  const cancelBooking = async (id: string) => {
    showConfirm('Cancel Booking?', 'Are you sure you want to cancel this booking?', async () => {
      const res = await fetch('/api/bookings/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: id }) });
      if (res.ok) { await fetchBookings(); showAlert('Cancelled', 'Booking cancelled successfully.', 'success'); }
      else { showAlert('Error', 'Failed to cancel booking.'); }
    });
  };

  const fetchActiveBlocks = async () => {
    try {
      const res = await fetch('/api/blocks');
      if (res.ok) setActiveBlocks(await res.json());
    } catch { /* ignore */ }
  };

  const handleBlockSlots = () => {
    if (!blockDate || !blockStart || !blockEnd || !blockReason) {
      showAlert('Missing Fields', 'Please fill all block fields.'); return;
    }
    const endDate = blockEndDate || blockDate;
    const label = blockDate === endDate ? blockDate : `${blockDate} → ${endDate}`;
    showConfirm('Block Turf?',
      `Block turf from ${label}, ${blockStart}:00 to ${blockEnd}:00?\nReason: ${blockReason}\n\nOverlapping bookings will be cancelled. All users will be notified.`,
      async () => {
        try {
          const res = await fetch('/api/admin/blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: blockDate, endDate, startTime: blockStart, endTime: blockEnd, reason: blockReason }),
          });
          const data = await res.json();
          if (!res.ok) { showAlert('Error', data.error || 'Block failed.'); return; }
          await fetchBookings(); await fetchActiveBlocks();
          showAlert('Blocked ✅', `Turf blocked for ${label}. ${data.cancelledCount} overlapping booking(s) cancelled. All users notified.`, 'success');
          setBlockDate(''); setBlockEndDate(''); setBlockStart(''); setBlockEnd('');
        } catch { showAlert('Error', 'Failed to block turf. Please try again.'); }
      });
  };

  const handleUnblock = (id: string, reason: string) => {
    showConfirm('Remove Block?', `Remove this block?\nReason: ${reason}\n\nAll users will be notified that slots are available again.`, async () => {
      try {
        const res = await fetch('/api/admin/blocks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        if (!res.ok) { showAlert('Error', 'Could not remove block.'); return; }
        await fetchBookings(); await fetchActiveBlocks();
        showAlert('Block Lifted ✅', 'Block removed. All users notified by email.', 'success');
      } catch { showAlert('Error', 'Failed to remove block.'); }
    });
  };

  const handleEditBlockReason = async (id: string, newReason: string) => {
    try {
      const res = await fetch('/api/admin/blocks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, reason: newReason }) });
      if (!res.ok) { showAlert('Error', 'Could not update reason.'); return; }
      setEditingBlock(null);
      await fetchActiveBlocks(); await fetchBookings();
      showAlert('Updated ✅', 'Block reason updated.', 'success');
    } catch { showAlert('Error', 'Failed to update.'); }
  };

  const handleResendBlockMail = async (block: any) => {
    const fh = (h: number) => `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
    showConfirm('Resend Email?', `Resend the block notification email to all users?\nDate: ${new Date(block.date).toLocaleDateString('en-IN')}\nReason: ${block.reason}`, async () => {
      try {
        const users = await fetch('/api/admin/users').then(r => r.json());
        const emails = users.map((u: any) => u.email).filter(Boolean);
        await fetch('/api/admin/send-block-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails, date: new Date(block.date).toLocaleDateString('en-IN'), startTime: fh(block.startTime), endTime: fh((block.startTime + block.durationHours) % 24), reason: block.reason }),
        });
        showAlert('Sent ✅', 'Block notification re-sent to all users.', 'success');
      } catch { showAlert('Error', 'Failed to resend emails.'); }
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/" style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(255,255,255,0.1)', color: '#fff', 
            padding: '8px 16px', borderRadius: '12px', textDecoration: 'none',
            fontWeight: 600
          }}>
            <Home size={18} /> Home
          </Link>
          <LogoutButton />
        </div>
      </motion.header>

      {/* ── TOP NAVIGATION ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 8, borderBottom: '1px solid var(--border-color)', marginTop: 16 }}>
        {(['overview', 'operations', 'bookings', 'users'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 22px',
              borderRadius: 99,
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: activeTab === tab ? '1px solid var(--primary-accent)' : '1px solid transparent',
              background: activeTab === tab ? 'var(--primary-accent-muted)' : 'transparent',
              color: activeTab === tab ? 'var(--primary-accent)' : 'var(--text-secondary)',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
      {/* ── STATS ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className={styles.statsGrid}>
        <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('TODAY')}>
          <h3>Bookings Today</h3>
          <p>{loading ? '...' : todayBookings}</p>
        </div>
        <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('DUE')}>
          <h3>Total Pending Dues</h3>
          <p style={{ color: '#FF4444' }}>{loading ? '...' : `₹${totalDue.toLocaleString('en-IN')}`}</p>
        </div>
        <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('PAID')}>
          <h3>Revenue Collected</h3>
          <p style={{ color: '#00E676' }}>{loading ? '...' : `₹${totalPaidThisMonth.toLocaleString('en-IN')}`}</p>
        </div>
        <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => handleStatCardClick('ALL')}>
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
        </>
      )}

      {activeTab === 'operations' && (
        <>
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
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Block the turf for Panchayath events, maintenance, or weather. Supports single-day or multi-day ranges. Overlapping bookings will be cancelled.
        </p>

        {/* Block Form */}
        <div className={styles.blockForm}>
          <div className={styles.inputGroup}>
            <label>Start Date</label>
            <input type="date" className={styles.inputField} value={blockDate} onChange={e => setBlockDate(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label>End Date <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>(same = single day)</span></label>
            <input type="date" className={styles.inputField} value={blockEndDate || blockDate} onChange={e => setBlockEndDate(e.target.value)} min={blockDate} />
          </div>
          <div className={styles.inputGroup}>
            <label>Block Start Hour</label>
            <select className={styles.selectField} value={blockStart} onChange={e => setBlockStart(e.target.value)}>
              <option value="">-- Select --</option>
              {Array.from({ length: 24 }, (_, i) => i).map(h => (
                <option key={h} value={h}>{h % 12 || 12}:00 {h >= 12 ? 'PM' : 'AM'}</option>
              ))}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Block End Hour</label>
            <select className={styles.selectField} value={blockEnd} onChange={e => setBlockEnd(e.target.value)}>
              <option value="">-- Select --</option>
              {Array.from({ length: 24 }, (_, i) => i + 1).map(h => (
                <option key={h} value={h}>{h % 12 || 12}:00 {h >= 12 ? 'PM' : 'AM'}</option>
              ))}
            </select>
          </div>
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Reason</label>
            <select className={styles.selectField} value={blockReason} onChange={e => setBlockReason(e.target.value)}>
              <option>Panchayath Event</option>
              <option>Maintenance</option>
              <option>Weather Condition</option>
              <option>Other</option>
            </select>
          </div>
          <button className={styles.blockBtn} onClick={handleBlockSlots} style={{ gridColumn: '1 / -1' }}>
            🚫 Block Turf
          </button>
          <div className={styles.emergencyNotice} style={{ gridColumn: '1 / -1' }}>
            <AlertTriangle size={16} /> Use with caution. This forces immediate cancellations and notifies all users by email.
          </div>
        </div>

        {/* Active Blocks Management Table */}
        {activeBlocks.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h3 style={{ color: '#fff', marginBottom: 12, fontSize: '1rem', fontWeight: 700 }}>
              Active & Upcoming Blocks ({activeBlocks.length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Time</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Reason</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBlocks.map((b: any) => {
                    const fh = (h: number) => `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
                    return (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', color: '#fff', fontWeight: 600 }}>
                          📅 {new Date(b.date).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.7)' }}>
                          {b.durationHours === 24 ? 'All Day' : `${fh(b.startTime)} – ${fh((b.startTime + b.durationHours) % 24)}`}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {editingBlock?.id === b.id ? (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input
                                value={editingBlock!.reason}
                                onChange={e => setEditingBlock({ ...editingBlock!, reason: e.target.value })}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: '0.85rem', fontFamily: 'inherit', flex: 1 }}
                              />
                              <button onClick={() => handleEditBlockReason(b.id, editingBlock!.reason)} style={{ background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.3)', color: '#00E676', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>Save</button>
                              <button onClick={() => setEditingBlock(null)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>✕</button>
                            </div>
                          ) : (
                            <span style={{ color: '#FF6B6B' }}>{b.reason}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button
                              onClick={() => setEditingBlock({ id: b.id, reason: b.reason })}
                              style={{ background: 'rgba(0,176,255,0.1)', border: '1px solid rgba(0,176,255,0.3)', color: '#00B0FF', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'inherit' }}
                            >✏️ Edit</button>
                            <button
                              onClick={() => handleResendBlockMail(b)}
                              style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'inherit' }}
                            >📧 Mail</button>
                            <button
                              onClick={() => handleUnblock(b.id, b.reason)}
                              style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'inherit' }}
                            >🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.section>
        </>
      )}

      {activeTab === 'users' && (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={styles.section}
      >
          /* ── USERS TABLE ── */
          <div>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>
              Registered Users ({users.length})
              <button onClick={fetchUsers} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginLeft: 8 }}>
                <RefreshCw size={18} />
              </button>
            </h2>
            {users.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No users registered yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Email</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Role</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Bookings</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => {
                      const allBookings = u.bookings ?? [];
                      const paidBookings = allBookings.filter((b: any) => b.status === 'PAID');
                      const dueBookings = allBookings.filter((b: any) => b.status === 'DUE' || b.status === 'PENDING');
                      const totalSpent = paidBookings.reduce((s: number, b: any) => s + b.amount, 0);
                      const totalDue = dueBookings.reduce((s: number, b: any) => s + b.amount, 0);
                      return (
                        <tr
                          key={u.id}
                          onClick={() => setSelectedUser(u)}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: i % 2 === 0 ? 'var(--bg-surface)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,230,118,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-surface)' : 'transparent')}
                        >
                          <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            {u.image
                              ? <img src={u.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                              : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--primary-accent)' }}>{u.name?.[0] ?? '?'}</div>
                            }
                            <span style={{ color: '#fff', fontWeight: 600 }}>{u.name ?? '—'}</span>
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, background: u.role === 'ADMIN' ? 'rgba(255,68,68,0.15)' : 'rgba(0,230,118,0.1)', color: u.role === 'ADMIN' ? '#FF4444' : 'var(--primary-accent)' }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#fff', fontWeight: 600 }}>{allBookings.filter((b: any) => b.status !== 'CANCELLED' && b.status !== 'BLOCKED').length}</td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ color: 'var(--primary-accent)', fontWeight: 700 }}>₹{totalSpent.toLocaleString()}</div>
                            {totalDue > 0 && <div style={{ color: '#FF4444', fontSize: '0.78rem' }}>₹{totalDue.toLocaleString()} due</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </motion.section>
      )}

      {activeTab === 'bookings' && (
      <motion.section
        ref={tableRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={styles.section}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {['ALL', 'TODAY', 'WEEK', 'MONTH', 'DUE', 'PAID', 'CANCELLED', 'NO_SHOW'].map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f as any)}
              style={{
                padding: '6px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                background: filterType === f ? 'var(--primary-accent-muted)' : 'transparent',
                border: filterType === f ? '1px solid var(--primary-accent)' : '1px solid var(--border-color)',
                color: filterType === f ? 'var(--primary-accent)' : 'var(--text-secondary)'
              }}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            {filterType.replace('_', ' ')} Bookings
            <button
              onClick={() => fetchBookings()}
              title="Refresh"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginLeft: 4 }}
            >
              <RefreshCw
                size={16}
                style={{ transition: 'transform 0.5s', transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)' }}
              />
            </button>
            {lastUpdated && (
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--primary-accent)',
                fontWeight: 500,
                marginLeft: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-accent)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Live · {secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`}
              </span>
            )}
          </h2>
          {filterType !== 'ALL' && (
            <button 
              onClick={() => setFilterType('ALL')} 
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Clear Filter
            </button>
          )}
        </div>
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
                {bookings
                  .filter(b => {
                    const [day, month, year] = b.date.split('/');
                    const bDate = new Date(`${year}-${month}-${day}`);
                    const now = new Date();
                    
                    if (filterType === 'TODAY') return b.date === todayStr && b.status !== 'CANCELLED';
                    if (filterType === 'WEEK') {
                      const diffTime = Math.abs(now.getTime() - bDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                      return diffDays <= 7 && b.status !== 'CANCELLED';
                    }
                    if (filterType === 'MONTH') {
                      return bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear() && b.status !== 'CANCELLED';
                    }
                    if (filterType === 'DUE') return b.status === 'DUE';
                    if (filterType === 'PAID') return b.status === 'PAID';
                    if (filterType === 'CANCELLED') return b.status === 'CANCELLED';
                    if (filterType === 'NO_SHOW') return b.status === 'PENDING' && bDate < new Date(now.setHours(0,0,0,0));
                    return true; // ALL
                  })
                  .map((booking) => (
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
                      {booking.status === 'BLOCKED' ? (
                        <button
                          onClick={() => handleUnblock(booking.id, booking.teamName.replace('[BLOCKED] ', ''))}
                          style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', color: '#00E676', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit' }}
                        >
                          ✅ Unblock
                        </button>
                      ) : booking.status !== 'CANCELLED' && (
                        <div className={styles.actionBtnGroup}>
                          {booking.status !== 'PAID' && (
                            <button onClick={() => markPaid(booking.id)} className={`${styles.actionBtn} ${styles.markPaid}`}>✅ Paid</button>
                          )}
                          {booking.status === 'PENDING' && (
                            <button onClick={() => markNoShow(booking.id)} className={`${styles.actionBtn} ${styles.markDue}`}>No-Show</button>
                          )}
                          <button onClick={() => cancelBooking(booking.id)} className={`${styles.actionBtn} ${styles.cancel}`}>Cancel</button>
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
      )}

      {/* ── User History Drawer (Portal) ── */}
      {selectedUser && typeof document !== 'undefined' && createPortal(
        <div
          onClick={e => { if (e.target === e.currentTarget) setSelectedUser(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', justifyContent: 'flex-end' }}
        >
          <div style={{ width: '100%', maxWidth: 460, background: 'var(--bg-color)', borderLeft: '1px solid var(--border-color)', overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {selectedUser.image
                  ? <img src={selectedUser.image} alt="" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                  : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: 'var(--primary-accent)' }}>{selectedUser.name?.[0] ?? '?'}</div>
                }
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{selectedUser.name ?? 'Unknown'}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{selectedUser.email}</div>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>✕</button>
            </div>
            {(() => {
              const bk: any[] = selectedUser.bookings ?? [];
              const active = bk.filter(b => b.status !== 'CANCELLED' && b.status !== 'BLOCKED');
              const paid = bk.filter(b => b.status === 'PAID');
              const due = bk.filter(b => b.status === 'DUE' || b.status === 'PENDING');
              const cancelled = bk.filter(b => b.status === 'CANCELLED');
              const totalPaid = paid.reduce((s, b) => s + b.amount, 0);
              const totalDue = due.reduce((s, b) => s + b.amount, 0);
              const fh = (h: number) => `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Total Matches', value: active.length, color: '#fff' },
                      { label: 'Cancelled', value: cancelled.length, color: '#FF4444' },
                      { label: 'Paid ✅', value: `₹${totalPaid.toLocaleString()}`, color: 'var(--primary-accent)' },
                      { label: 'Due 🔴', value: `₹${totalDue.toLocaleString()}`, color: totalDue > 0 ? '#FF4444' : 'var(--text-secondary)' },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border-color)' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 4 }}>{stat.label}</div>
                        <div style={{ color: stat.color, fontWeight: 900, fontSize: '1.25rem' }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', marginBottom: 12, fontSize: '0.95rem', fontWeight: 700 }}>Booking History</h4>
                    {bk.length === 0
                      ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No bookings yet.</p>
                      : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {bk.map(b => {
                            const statusColor = b.status === 'PAID' ? 'var(--primary-accent)' : b.status === 'DUE' || b.status === 'PENDING' ? '#FF4444' : 'var(--text-secondary)';
                            return (
                              <div key={b.id} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                <div>
                                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{b.team?.name ?? '—'}</div>
                                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 2 }}>
                                    {new Date(b.date).toLocaleDateString('en-IN')} · {fh(b.startTime)}–{fh((b.startTime + b.durationHours) % 24)}
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ color: statusColor, fontWeight: 700, fontSize: '0.82rem' }}>{b.status}</div>
                                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>₹{b.amount}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                    }
                  </div>
                </>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

      <CustomModal {...customModal} />
    </div>
  );
}
