'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle, X } from 'lucide-react';

export const openTermsModal = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('open-terms-modal'));
  }
};

export default function TermsModal() {
  const { status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mustAccept, setMustAccept] = useState(false);

  useEffect(() => {
    // Check if user needs to accept terms on login
    if (status === 'authenticated') {
      const hasAccepted = localStorage.getItem('hasAcceptedTerms');
      if (!hasAccepted) {
        setIsOpen(true);
        setMustAccept(true);
      }
    }
  }, [status]);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setMustAccept(false);
    };
    window.addEventListener('open-terms-modal', handleOpen);
    return () => window.removeEventListener('open-terms-modal', handleOpen);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('hasAcceptedTerms', 'true');
    setIsOpen(false);
    setMustAccept(false);
  };

  const handleClose = () => {
    if (!mustAccept) {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999999,
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
      >
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldAlert color="var(--primary-accent)" size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>Terms & Conditions</h2>
          </div>
          {!mustAccept && (
            <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          )}
        </div>
        
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          <p style={{ marginBottom: 16 }}>Welcome to <strong>East Welfare Turf</strong>. By using our booking system, you agree to the following operational policies and rules:</p>
          
          <h3 style={{ color: '#fff', fontSize: '1.05rem', marginTop: 24, marginBottom: 8 }}>1. Booking Rules & Windows</h3>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>Bookings can only be made up to <strong>3 days in advance</strong>.</li>
            <li>Users must provide a valid WhatsApp phone number and Team Name for confirmation.</li>
            <li>Pricing is dynamically categorized into <strong>Peak Hours (Night)</strong> and <strong>Off-Peak Hours (Day)</strong>.</li>
          </ul>

          <h3 style={{ color: '#fff', fontSize: '1.05rem', marginTop: 24, marginBottom: 8 }}>2. Payments</h3>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>All payments are to be made <strong>at the venue</strong> prior to your slot.</li>
            <li>If you have pending past dues, they will remain on your dashboard until cleared by the admin.</li>
          </ul>

          <h3 style={{ color: '#fff', fontSize: '1.05rem', marginTop: 24, marginBottom: 8 }}>3. Cancellations & No-Shows</h3>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>You may cancel a booking directly from your dashboard up to <strong>30 minutes before</strong> the slot starts.</li>
            <li>Cancellations within 30 minutes of the start time are strictly prohibited.</li>
            <li>Failing to show up for a booked slot (No-Show) may incur a <strong>50% penalty fee</strong> at the discretion of the turf admin. This will remain on your account as a pending due.</li>
          </ul>

          <h3 style={{ color: '#fff', fontSize: '1.05rem', marginTop: 24, marginBottom: 8 }}>4. Turf Management & Emergency Blocks</h3>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>The management reserves the right to <strong>block the turf</strong> for maintenance, tournaments, or extreme weather conditions.</li>
            <li>If an emergency block overlaps with your booking, your booking will be <strong>automatically cancelled</strong>, and the cancellation reason will be specified on your receipt.</li>
          </ul>
          
          <p style={{ marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            By checking out or signing into our app, you acknowledge these conditions and agree to maintain sportsmanship and discipline on the premises.
          </p>
        </div>

        {mustAccept ? (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <button
              onClick={handleAccept}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--primary-accent)',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <CheckCircle size={20} /> I Have Read and Accept the Terms
            </button>
          </div>
        ) : (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)', textAlign: 'right' }}>
            <button
              onClick={handleClose}
              style={{
                padding: '10px 24px',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
