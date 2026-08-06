'use client';

import { useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function FloatingContact() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Hide on admin panel to keep it clutter-free
  if (pathname.startsWith('/admin')) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
      }}
    >
      {/* WhatsApp Quick Chat */}
      <a
        href="https://wa.me/917994786085?text=Hi,%20I%20would%20like%20to%20inquire%20about%20booking%20a%20turf%20slot%20at%20East%20Welfare%20Turf."
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '99px',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isHovered ? 'scale(1.06) translateY(-2px)' : 'scale(1)',
        }}
      >
        <MessageCircle size={20} />
        <span style={{ whiteSpace: 'nowrap' }}>WhatsApp Support</span>
      </a>

      {/* Direct Call Button (Mobile friendly) */}
      <a
        href="tel:+917994786085"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '42px',
          height: '42px',
          background: 'rgba(20, 20, 28, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#00E676',
          borderRadius: '50%',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s',
        }}
        title="Call East Welfare Turf"
      >
        <Phone size={18} />
      </a>
    </div>
  );
}
