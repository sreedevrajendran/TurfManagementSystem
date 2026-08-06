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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={48} color="#00E676" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#94A3B8', fontSize: '1rem' }}>Loading player dashboard...</p>
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

  const pendingDues = bookings.filter((b) => b.status === 'DUE');
  
  const clearedBookings = bookings
    .filter((b) => b.status === 'PAID')
    .sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.date).getTime();
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.date).getTime();
      return timeB - timeA;
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
        <div>
          <h1 className={styles.title}>PLAYER DASHBOARD</h1>
          <p className={styles.subtitle}>Welcome back, {session?.user?.name}! Manage your match fixtures and player pass.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/book" className="btn-primary">
            <Calendar size={18} /> Book New Match
          </Link>
        </div>
      </header>

      {/* Digital Player Turf Pass */}
      <div className={styles.playerPassCard}>
        <div className={styles.playerPassLeft}>
          <div className={styles.playerAvatar}>
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <div className={styles.playerName}>{session?.user?.name || 'Verified Player'}</div>
            <div className={styles.playerEmail}>{session?.user?.email}</div>
            <div className={styles.playerTag}>
              <Sparkles size={12} /> East Welfare Turf Club Member
            </div>
          </div>
        </div>

        <div className={styles.playerPassRight}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Bookings</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00E676' }}>{bookings.length}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24, textAlign: 'right' }}>
        <button onClick={() => openTermsModal()} style={{ background: 'none', border: 'none', color: '#94A3B8', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>
          📜 View Booking Terms &amp; Policies
        </button>
      </div>

      <div className={styles.grid}>
        {/* Active Fixtures / Pending Dues */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Clock color="#00E676" size={24} />
            <span>Active &amp; Upcoming Matches ({pendingDues.length})</span>
          </h2>

          {pendingDues.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle color="#00E676" size={48} />
              <p style={{ fontSize: '1.1rem', color: '#FFFFFF', fontWeight: 700 }}>No pending dues or upcoming matches.</p>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Ready for your next game under the stadium floodlights?</p>
              <Link href="/book" className="btn-primary" style={{ marginTop: '12px' }}>
                <Calendar size={18} /> Reserve a Court
              </Link>
            </div>
          ) : (
            <ul className={styles.list}>
              {pendingDues.map((due) => {
                const bd = new Date(due.date);
                bd.setHours(due.startTime, 0, 0, 0);
                const canCancel = bd.getTime() - Date.now() >= 30 * 60 * 1000;
                const sportEmoji = due.sport === 'CRICKET' ? '🏏' : '⚽';

                return (
                  <li key={due.id} className={styles.dueItem}>
                    <div>
                      <strong>
                        {sportEmoji} {due.teamName || 'Your Match'} • {new Date(due.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </strong>
                      <p>
                        Time: {formatTime(due.startTime)} – {formatTime((due.startTime + due.durationHours) % 24)} ({due.durationHours} hr)
                      </p>
                      <p style={{ fontSize: '0.82rem', color: '#00E676' }}>
                        📍 Venue: East Welfare Turf, Mannar
                      </p>

                      <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        {canCancel ? (
                          <CancelBookingButton
                            bookingId={due.id}
                            onSuccess={() => setBookings((prev) => prev.map((b) => (b.id === due.id ? { ...b, status: 'CANCELLED' } : b)))}
                          />
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#FF6B6B' }}>
                            Match starting soon
                          </span>
                        )}

                        <button
                          onClick={() => {
                            const img = generateReceiptImage({
                              teamName: due.teamName || session?.user?.name || 'Team',
                              sport: due.sport === 'CRICKET' ? 'Cricket' : 'Football',
                              date: new Date(due.date).toLocaleDateString('en-IN'),
                              time: `${formatTime(due.startTime)} – ${formatTime((due.startTime + due.durationHours) % 24)}`,
                              duration: due.durationHours,
                              phone: due.phone || '',
                              amount: due.amount,
                              paymentStatus: 'DUE',
                            });
                            const a = document.createElement('a');
                            a.href = img;
                            a.download = `EastWelfareTurf_Pass_${due.teamName || 'match'}.png`;
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
                          <Download size={14} /> Match Pass Receipt
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className={styles.dueAmount}>₹{due.amount}</span>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4 }}>Pay at venue</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Cleared / Completed Matches */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Trophy color="#00E5FF" size={24} />
            <span>Match History ({clearedBookings.length})</span>
          </h2>
          <PastBookingsList bookings={clearedBookings} />
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
