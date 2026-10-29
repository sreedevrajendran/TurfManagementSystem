'use client';

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

type CustomModalProps = {
  isOpen: boolean;
  type: 'alert' | 'confirm' | 'success' | 'warning';
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode;
};

export default function CustomModal({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  children,
}: CustomModalProps) {
  if (typeof document === 'undefined') return null;

  const accentColor = type === 'alert' ? '#FF4D4D' : type === 'warning' ? '#FFB800' : type === 'success' ? '#00E676' : '#00B0FF';
  const glowColor = type === 'alert' ? 'rgba(255, 77, 77, 0.25)' : type === 'warning' ? 'rgba(255, 184, 0, 0.25)' : type === 'success' ? 'rgba(0, 230, 118, 0.25)' : 'rgba(0, 176, 255, 0.25)';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(5, 5, 8, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && onCancel) {
              onCancel();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            style={{
              background: 'linear-gradient(180deg, #161622 0%, #0F0F17 100%)',
              border: `1px solid ${accentColor}33`,
              borderRadius: '24px',
              padding: '32px 28px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 40px ${glowColor}`,
              position: 'relative',
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: `0 0 20px ${glowColor}`,
            }}>
              {type === 'alert' && <AlertTriangle size={34} color="#FF4D4D" />}
              {type === 'warning' && <AlertTriangle size={34} color="#FFB800" />}
              {type === 'success' && <CheckCircle size={34} color="#00E676" />}
              {type === 'confirm' && <Info size={34} color="#00B0FF" />}
            </div>

            <h3 style={{
              color: '#FFFFFF',
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '10px'
            }}>
              {title}
            </h3>
            
            <p style={{
              color: 'rgba(240, 240, 245, 0.75)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: children ? '20px' : '28px',
              whiteSpace: 'pre-line'
            }}>
              {message}
            </p>

            {children && <div style={{ marginBottom: '24px' }}>{children}</div>}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {(type === 'confirm' || type === 'warning' || !!onCancel) && (
                <button
                  onClick={onCancel}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#E5E7EB',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    flex: 1,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  {cancelText}
                </button>
              )}
              
              <button
                onClick={onConfirm}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: type === 'alert' ? '#FF4D4D' : type === 'warning' ? '#FFB800' : type === 'success' ? '#00E676' : '#00B0FF',
                  color: '#000000',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  flex: 1,
                  boxShadow: `0 4px 20px ${glowColor}`,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
