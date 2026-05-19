'use client';

import { useState } from 'react';
import styles from '@/app/dashboard/page.module.css';

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
  status: string;
};

export default function PastBookingsList({ bookings }: { bookings: BookingRecord[] }) {
  const [showAll, setShowAll] = useState(false);
  const visibleBookings = showAll ? bookings : bookings.slice(0, 3);

  if (bookings.length === 0) {
    return <p style={{ color: "var(--text-secondary)" }}>No past bookings found.</p>;
  }

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
