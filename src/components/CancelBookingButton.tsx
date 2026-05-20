'use client';

import { useState } from 'react';
import CustomModal from '@/components/CustomModal';

export default function CancelBookingButton({
  bookingId,
  onSuccess,
}: {
  bookingId: string;
  onSuccess?: () => void;
}) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [customModal, setCustomModal] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'success';
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const handleCancelClick = () => {
    setCustomModal({
      isOpen: true,
      type: 'confirm',
      title: 'Cancel Booking?',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone and the slot will be released for others.',
      onConfirm: async () => {
        setCustomModal(null);
        setIsCancelling(true);
        try {
          const res = await fetch('/api/bookings/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId }),
          });

          if (res.ok) {
            if (onSuccess) onSuccess();
          } else {
            const err = await res.json();
            setCustomModal({
              isOpen: true,
              type: 'alert',
              title: 'Cannot Cancel',
              message: err.error || 'Failed to cancel the booking.',
              onConfirm: () => setCustomModal(null),
            });
          }
        } catch {
          setCustomModal({
            isOpen: true,
            type: 'alert',
            title: 'Network Error',
            message: 'Please try again later.',
            onConfirm: () => setCustomModal(null),
          });
        } finally {
          setIsCancelling(false);
        }
      },
      onCancel: () => setCustomModal(null),
    });
  };

  return (
    <>
      <button
        onClick={handleCancelClick}
        disabled={isCancelling}
        style={{
          background: 'rgba(255, 68, 68, 0.1)',
          color: '#FF4444',
          border: '1px solid rgba(255, 68, 68, 0.3)',
          padding: '6px 12px',
          borderRadius: '8px',
          cursor: isCancelling ? 'not-allowed' : 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginTop: '8px',
          transition: 'all 0.2s',
          opacity: isCancelling ? 0.5 : 1,
        }}
      >
        {isCancelling ? 'Cancelling...' : 'Cancel Slot'}
      </button>
      {customModal && <CustomModal {...customModal} />}
    </>
  );
}
