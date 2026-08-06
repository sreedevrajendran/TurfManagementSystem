'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { X, Sparkles, Zap, ShieldCheck, Trophy, Bell, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: 'rgba(5, 6, 8, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(180deg, #13151D 0%, #0B0C10 100%)',
            border: '1px solid rgba(0, 230, 118, 0.3)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 230, 118, 0.15)',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '36px 32px',
            position: 'relative',
            color: '#FFFFFF',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Glow */}
          <div 
            style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(0, 230, 118, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close welcome modal"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94A3B8';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <X size={18} />
          </button>

          {/* Header Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 230, 118, 0.12)',
              border: '1px solid rgba(0, 230, 118, 0.3)',
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#00E676',
              marginBottom: '16px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={14} /> EAST WELFARE TURF CLUB
          </div>

          <h3
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: '8px',
              letterSpacing: '-0.02em',
            }}
          >
            Unlock Instant <span style={{ color: '#00E676' }}>VIP Access</span>
          </h3>

          <p
            style={{
              color: '#94A3B8',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            Sign in with Google to reserve your court instantly, download digital match receipts, and track your team’s stats.
          </p>

          {/* Benefits Grid */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 230, 118, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E676', flexShrink: 0 }}>
                <Zap size={16} />
              </div>
              <span style={{ fontSize: '0.9rem', color: '#E2E8F0' }}><strong>60-Second Fast Booking:</strong> Reserve slots with zero delay</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E5FF', flexShrink: 0 }}>
                <Trophy size={16} />
              </div>
              <span style={{ fontSize: '0.9rem', color: '#E2E8F0' }}><strong>Digital Player Match Pass:</strong> Keep track of your fixtures</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 184, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFB800', flexShrink: 0 }}>
                <Bell size={16} />
              </div>
              <span style={{ fontSize: '0.9rem', color: '#E2E8F0' }}><strong>Instant WhatsApp Receipts:</strong> Instant confirmation & venue pin</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={() => signIn('google', { callbackUrl: window.location.pathname })}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              background: '#FFFFFF',
              color: '#0F172A',
              padding: '16px 24px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '1.05rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 8px 24px rgba(255, 255, 255, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.15)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: '0.78rem',
              color: '#64748B',
              marginTop: '16px',
            }}
          >
            By signing in, you agree to the East Welfare Turf Terms &amp; Fair Play Rules.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
