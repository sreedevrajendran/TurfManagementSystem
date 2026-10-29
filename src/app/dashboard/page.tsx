'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import styles from './page.module.css';
import { 
  AlertCircle, 
  CheckCircle, 
  Home, 
  Loader2, 
  Calendar, 
  Trophy, 
  Share2, 
  Download, 
  Clock,
  Sparkles,
  MapPin
} from 'lucide-react';
import CancelBookingButton from '@/components/CancelBookingButton';
import PastBookingsList from '@/components/PastBookingsList';
import { generateReceiptImage } from '@/lib/generateReceipt';
import { openTermsModal } from '@/components/TermsModal';

type Booking = {
  id: string;
  date: string;
  startTime: number;
  durationHours: number;
  amount: number;
  status: string;
  reason?: string | null;
  sport: string;
  teamName: string | null;
  phone?: string | null;
  updatedAt?: string | null;
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
      setLoading(true);
      setError(null);

      const fetchBookings = () =>
        fetch('/api/user/bookings')
          .then((r) => {
            if (!r.ok) throw new Error('Failed to load bookings');
            return r.json();
          })
          .then((data) => {
            if (Array.isArray(data)) {
              setBookings(data);
            } else {
              throw new Error('Invalid response');
            }
            setLoading(false);
          });

      // Try once, then retry once on failure (handles cold start)
      fetchBookings().catch(() => {
        setTimeout(() => {
          fetchBookings().catch((e) => {
            setError(e.message);
            setLoading(false);
          });
        }, 2500);
      });
    } else if (status === 'unauthenticated') {
      signIn('google');
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={48} color="#00E676" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#94A3B8', fontSize: '1rem' }}>Loading dashboard...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
        <AlertCircle size={48} color="#FF4444" />
        <p style={{ color: '#FF4444', fontSize: '1.1rem' }}>Failed to load bookings. Please refresh the page.</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const parseBookingDateTime = (dateStr: string, hour: number = 0): Date => {
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [d, m, y] = parts.map(Number);
        return new Date(y, m - 1, d, hour, 0, 0, 0);
      }
    }
    const d = new Date(dateStr);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const now = new Date();

  // Active & Upcoming matches (match has not concluded yet)
  const upcomingMatches = bookings
    .filter((b) => {
      if (b.status === 'CANCELLED') return false;
      const start = parseBookingDateTime(b.date, b.startTime);
      const end = new Date(start.getTime() + (b.durationHours || 1) * 3600 * 1000);
      return end > now;
    })
    .sort((a, b) => {
      const startA = parseBookingDateTime(a.date, a.startTime).getTime();
      const startB = parseBookingDateTime(b.date, b.startTime).getTime();
      return startA - startB;
    });

  // Concluded / Past matches (match end time has passed)
  const pastMatches = bookings
    .filter((b) => {
      if (b.status === 'CANCELLED') return false;
      const start = parseBookingDateTime(b.date, b.startTime);
      const end = new Date(start.getTime() + (b.durationHours || 1) * 3600 * 1000);
      return end <= now;
    })
    .sort((a, b) => {
      const startA = parseBookingDateTime(a.date, a.startTime).getTime();
      const startB = parseBookingDateTime(b.date, b.startTime).getTime();
      return startB - startA;
    });

  const cancelledBookings = bookings
    .filter((b) => b.status === 'CANCELLED')
    .sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    });

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div style={{ flex: 1 }}>
          <h1 className={styles.title}>MY DASHBOARD</h1>
          <p className={styles.subtitle}>Welcome back, {session?.user?.name}! Manage your bookings and fixtures.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/book" className={styles.bookButtonTop}>
            <Calendar size={20} /> Book Slot
          </Link>
        </div>
      </header>

      <div style={{ marginBottom: 24, textAlign: 'right' }}>
        <button onClick={() => openTermsModal()} style={{ background: 'none', border: 'none', color: '#94A3B8', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>
          📜 View Booking Terms &amp; Policies
        </button>
      </div>

      <div className={styles.grid}>
        {/* Active & Upcoming Matches */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Clock color="#00E676" size={24} />
            <span>Active &amp; Upcoming Matches ({upcomingMatches.length})</span>
          </h2>

          {upcomingMatches.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle color="#00E676" size={48} />
              <p style={{ fontSize: '1.1rem', color: '#FFFFFF', fontWeight: 700 }}>No upcoming matches right now.</p>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Ready for your next game under the stadium floodlights?</p>
              <Link href="/book" className="btn-primary" style={{ marginTop: '12px' }}>
                <Calendar size={18} /> Book a Slot
              </Link>
            </div>
          ) : (
            <ul className={styles.list}>
              {upcomingMatches.map((due) => {
                const start = parseBookingDateTime(due.date, due.startTime);
                const end = new Date(start.getTime() + (due.durationHours || 1) * 3600 * 1000);
                const isLive = now >= start && now < end;
                const diffMs = start.getTime() - now.getTime();
                const canCancel = diffMs >= 2 * 60 * 60 * 1000;
                const isStartingSoon = diffMs > 0 && diffMs < 2 * 60 * 60 * 1000;
                const sportEmoji = due.sport === 'CRICKET' ? '🏏' : '⚽';

                return (
                  <li key={due.id} className={styles.dueItem}>
                    <div>
                      <strong>
                        {sportEmoji} {due.teamName || 'Your Match'} • {start.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </strong>
                      <p>
                        Time: {formatTime(due.startTime)} – {formatTime((due.startTime + due.durationHours) % 24)} ({due.durationHours} hr)
                      </p>
                      <p style={{ fontSize: '0.82rem', color: '#00E676' }}>
                        📍 Venue: East Welfare Turf, Mannar
                      </p>

                      <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        {isLive ? (
                          <span style={{ fontSize: '0.8rem', color: '#00E676', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00E676', display: 'inline-block' }} />
                            Match in Progress
                          </span>
                        ) : isStartingSoon ? (
                          <span style={{ fontSize: '0.8rem', color: '#FFB800', fontWeight: 600 }}>
                            ⏳ Match starting soon (Non-cancellable)
                          </span>
                        ) : canCancel ? (
                          <CancelBookingButton
                            bookingId={due.id}
                            onSuccess={() => setBookings((prev) => prev.map((b) => (b.id === due.id ? { ...b, status: 'CANCELLED' } : b)))}
                          />
                        ) : null}

                        <button
                          onClick={() => {
                            const img = generateReceiptImage({
                              teamName: due.teamName || session?.user?.name || 'Team',
                              sport: due.sport === 'CRICKET' ? 'Cricket' : 'Football',
                              date: start.toLocaleDateString('en-IN'),
                              time: `${formatTime(due.startTime)} – ${formatTime((due.startTime + due.durationHours) % 24)}`,
                              duration: due.durationHours,
                              phone: due.phone || '',
                              amount: due.amount,
                              paymentStatus: due.status === 'PAID' ? 'CONFIRMED' : 'DUE',
                            });
                            const a = document.createElement('a');
                            a.href = img;
                            a.download = `EastWelfareTurf_Receipt_${due.teamName || 'match'}.png`;
                            a.click();
                          }}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#FFFFFF',
                            borderRadius: 10,
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Download size={14} /> Match Receipt
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className={styles.dueAmount}>₹{due.amount}</span>
                      <div style={{ fontSize: '0.75rem', color: due.status === 'PAID' ? '#00E676' : '#94A3B8', marginTop: 4 }}>
                        {due.status === 'PAID' ? 'Paid Online' : 'Pay at venue'}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Concluded / Match History */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Trophy color="#00E5FF" size={24} />
            <span>Match History ({pastMatches.length})</span>
          </h2>
          <PastBookingsList bookings={pastMatches} />
        </section>

        {/* Cancelled Bookings */}
        {cancelledBookings.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <AlertCircle color="#FF6B6B" size={24} />
              <span>Cancelled Bookings ({cancelledBookings.length})</span>
            </h2>
            <PastBookingsList bookings={cancelledBookings} />
          </section>
        )}
      </div>
    </div>
  );
}
