'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import styles from './page.module.css';
import { AlertCircle, CheckCircle, Home, Loader2 } from 'lucide-react';
import CancelBookingButton from '@/components/CancelBookingButton';
import PastBookingsList from '@/components/PastBookingsList';

type Booking = {
  id: string;
  date: string;
  startTime: number;
  durationHours: number;
  amount: number;
  status: string;
  teamName: string | null;
};

const formatTime = (hour: number) => {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:00 ${ampm}`;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/bookings')
        .then((r) => {
          if (!r.ok) throw new Error('Failed to load bookings');
          return r.json();
        })
        .then((data) => {
          setBookings(data);
          setLoading(false);
        })
        .catch((e) => {
          setError(e.message);
          setLoading(false);
        });
    } else if (status === 'unauthenticated') {
      signIn('google');
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={48} color="#00B0FF" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>Loading your dashboard...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <AlertCircle size={48} color="#FF4444" />
        <p style={{ color: '#FF4444', fontSize: '1.1rem' }}>Failed to load bookings. Please refresh the page.</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', background: '#00B0FF', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const pendingDues = bookings.filter((b) => b.status === 'DUE');
  const pastBookings = bookings.filter((b) => b.status === 'PAID' || b.status === 'CANCELLED');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome, {session?.user?.name}</h1>
          <p className={styles.subtitle}>Manage your bookings and view your due status here.</p>
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
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <AlertCircle color="#FF4444" size={24} /> Pending Dues
          </h2>
          {pendingDues.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle color="#00E676" size={48} />
              <p>You have no pending dues! You are ready to book.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {pendingDues.map((due) => {
                const bd = new Date(due.date);
                bd.setHours(due.startTime, 0, 0, 0);
                const canCancel = bd.getTime() - Date.now() >= 30 * 60 * 1000;
                return (
                  <li key={due.id} className={styles.dueItem}>
                    <div>
                      <strong>{new Date(due.date).toDateString()}</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                        {formatTime(due.startTime)} – {formatTime((due.startTime + due.durationHours) % 24)}
                      </p>
                      {due.teamName && <p>Team: {due.teamName}</p>}
                      {canCancel ? (
                        <CancelBookingButton bookingId={due.id} onSuccess={() => setBookings((prev) => prev.map((b) => b.id === due.id ? { ...b, status: 'CANCELLED' } : b))} />
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#FF6B6B', marginTop: '8px', display: 'inline-block' }}>
                          Too late to cancel
                        </span>
                      )}
                    </div>
                    <span className={styles.dueAmount}>₹{due.amount}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Past Bookings &amp; Cleared Dues</h2>
          <PastBookingsList bookings={pastBookings} />
        </section>
      </div>
    </div>
  );
}
