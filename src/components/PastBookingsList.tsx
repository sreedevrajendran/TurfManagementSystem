'use client';

import { useState } from 'react';
import styles from '@/app/dashboard/page.module.css';
import { generateReceiptImage } from '@/lib/generateReceipt';

const formatTime = (hour: number) => {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:00 ${ampm}`;
};

type BookingRecord = {
  id: string;
  date: string;
  startTime: number;
  durationHours: number;
  amount?: number;
  status: string;
  sport?: string;
  teamName?: string | null;
  phone?: string | null;
};

export default function PastBookingsList({ bookings }: { bookings: BookingRecord[] }) {
  const [showAll, setShowAll] = useState(false);
  const visibleBookings = showAll ? bookings : bookings.slice(0, 3);

  if (bookings.length === 0) {
    return <p style={{ color: "var(--text-secondary)" }}>No past bookings found.</p>;
  }

  const handleDownload = (booking: BookingRecord) => {
    const img = generateReceiptImage({
      teamName: booking.teamName || 'Team',
      sport: booking.sport === 'CRICKET' ? 'Cricket' : 'Football',
      date: new Date(booking.date).toLocaleDateString('en-IN'),
      time: `${formatTime(booking.startTime)} – ${formatTime((booking.startTime + booking.durationHours) % 24)}`,
      duration: booking.durationHours,
      phone: booking.phone || '',
      amount: booking.amount ?? 0,
      paymentStatus: booking.status === 'PAID' ? 'CONFIRMED' : booking.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
    });
    const a = document.createElement('a');
    a.href = img;
    a.download = `Receipt_${booking.teamName || 'booking'}_${booking.status}_${Date.now()}.png`;
    a.click();
  };

  return (
    <>
      <ul className={styles.list}>
        {visibleBookings.map(booking => (
          <li key={booking.id} className={styles.historyItem}>
            <div>
              <strong>{new Date(booking.date).toDateString()}</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {formatTime(booking.startTime)} – {formatTime((booking.startTime + booking.durationHours) % 24)}
              </p>
              {booking.teamName && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0' }}>Team: {booking.teamName}</p>
              )}
              {booking.amount !== undefined && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{booking.amount}</p>
              )}
              <button
                onClick={() => handleDownload(booking)}
                style={{ marginTop: 8, padding: '5px 12px', background: 'rgba(0,176,255,0.1)', border: '1px solid rgba(0,176,255,0.3)', color: '#00B0FF', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit' }}
              >
                🧾 Receipt
              </button>
            </div>
            <span className={booking.status === "PAID" ? styles.paidStatus : styles.cancelledStatus}>
              {booking.status}
            </span>
          </li>
        ))}
      </ul>
      {bookings.length > 3 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          {showAll ? 'Show Less' : `View Full History (${bookings.length})`}
        </button>
      )}
    </>
  );
}
