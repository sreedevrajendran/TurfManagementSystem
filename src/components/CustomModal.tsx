'use client';

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

type CustomModalProps = {
  isOpen: boolean;
  type: 'alert' | 'confirm' | 'success';
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
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              background: '#111118',
              border: `1px solid ${type === 'alert' ? '#FF4444' : type === 'success' ? '#00E676' : '#00B0FF'}`,
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              {type === 'alert' && <AlertTriangle size={48} color="#FF4444" />}
              {type === 'success' && <CheckCircle size={48} color="#00E676" />}
              {type === 'confirm' && <Info size={48} color="#00B0FF" />}
            </div>

            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '12px' }}>{title}</h3>
            
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.5, marginBottom: '32px', whiteSpace: 'pre-line' }}>
              {message}
            </p>

            {children && <div style={{ marginBottom: '24px' }}>{children}</div>}

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              {type === 'confirm' && (
                <button
                  onClick={onCancel}
                  style={{
                    padding: '12px 24px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600,
                    cursor: 'pointer', flex: 1,
                  }}
                >
                  {cancelText}
                </button>
              )}
              
              <button
                onClick={onConfirm}
                style={{
                  padding: '12px 24px', borderRadius: '12px',
                  background: type === 'alert' ? '#FF4444' : type === 'success' ? '#00E676' : '#00B0FF',
                  color: '#000', border: 'none', fontWeight: 700,
                  cursor: 'pointer', flex: 1,
                }}
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
