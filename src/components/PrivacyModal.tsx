'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, X } from 'lucide-react';

export const openPrivacyModal = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('open-privacy-modal'));
  }
};

export default function PrivacyModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-privacy-modal', handleOpen);
    return () => window.removeEventListener('open-privacy-modal', handleOpen);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
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
            <Shield color="var(--primary-accent)" size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>Privacy Policy</h2>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          <p style={{ marginBottom: 16 }}>Last updated: <strong>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}</strong></p>
          <p style={{ marginBottom: 16 }}>At <strong>East Welfare Turf</strong>, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy explains what information we collect, how we use it, and your rights.</p>
          
          <h3 style={{ color: '#fff', fontSize: '1.05rem', marginTop: 24, marginBottom: 8 }}>1. Information We Collect</h3>
          <p style={{ marginBottom: 12 }}>We only collect essential information required to manage bookings and secure turf scheduling:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Google Profile Data:</strong> When you sign in with Google, we access your name, email address, and profile picture. This is used solely to identify your account and personalize your dashboard.</li>
            <li><strong>Booking Contact Details:</strong> When scheduling a turf slot, you provide a phone number and your Team Name. This is critical for turf operational coordinators to contact you in case of schedule changes, rain delays, or emergency slot cancellations.</li>
          </ul>

          <h3 style={{ color: '#fff', fontSize: '1.05rem', marginTop: 24, marginBottom: 8 }}>2. How We Use Your Information</h3>
          <p style={{ marginBottom: 12 }}>Your information is strictly used for the following purposes:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>To process, schedule, and manage your turf bookings.</li>
            <li>To display your booking history and status on your personalized user dashboard.</li>
            <li>To send critical operational notifications (e.g., booking confirmation, cancellation alerts, or slot adjustments).</li>
            <li>To track account dues and ensure fair utilization of the facility.</li>
          </ul>

          <h3 style={{ color: '#fff', fontSize: '1.05rem', marginTop: 24, marginBottom: 8 }}>3. Data Protection & Sharing</h3>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>No Third-Party Sharing:</strong> We do NOT sell, rent, lease, or share your personal data with any third-party advertisers or marketers.</li>
            <li><strong>Security Measures:</strong> We employ standard secure hosting and database protocols to safeguard your personal data against unauthorized access, loss, or manipulation.</li>
          </ul>

          <h3 style={{ color: '#fff', fontSize: '1.05rem', marginTop: 24, marginBottom: 8 }}>4. Data Deletion & Your Rights</h3>
          <p style={{ marginBottom: 12 }}>You have full control over your personal data. If you wish to delete your account and remove all your information from our booking system, you can submit a request:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>Contact us directly at <a href="mailto:eastwelfareturf@gmail.com" style={{ color: 'var(--primary-accent)', textDecoration: 'underline' }}>eastwelfareturf@gmail.com</a>.</li>
            <li>Call or message our support line at <a href="tel:+919778518909" style={{ color: 'var(--primary-accent)', textDecoration: 'underline' }}>+91 97785 18909</a>.</li>
          </ul>
          <p>Upon verification, your profile data, booking history, and active records will be permanently erased from our databases within 48 hours.</p>

          <p style={{ marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            By signing in or booking a slot, you consent to this Privacy Policy. We may update this policy occasionally, and any updates will be posted here.
          </p>
        </div>

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
      </motion.div>
    </div>
  );
}
