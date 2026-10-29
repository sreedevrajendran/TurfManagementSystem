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
    <>
      <div className="floating-contact-container">
        {/* WhatsApp Quick Chat */}
        <a
          href="https://wa.me/917994786085?text=Hi,%20I%20would%20like%20to%20inquire%20about%20booking%20a%20turf%20slot%20at%20East%20Welfare%20Turf."
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="whatsapp-btn"
          style={{
            transform: isHovered ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
          }}
        >
          <MessageCircle size={18} />
          <span className="whatsapp-label">WhatsApp</span>
        </a>

        {/* Direct Call Button (Mobile friendly) */}
        <a
          href="tel:+917994786085"
          className="phone-btn"
          title="Call East Welfare Turf"
        >
          <Phone size={17} />
        </a>
      </div>

      <style jsx>{`
        .floating-contact-container {
          position: fixed;
          bottom: 24px;
          right: 20px;
          z-index: 997;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          pointer-events: none;
        }

        .whatsapp-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: #ffffff;
          padding: 10px 16px;
          border-radius: 9999px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.85rem;
          box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }

        .phone-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: rgba(18, 22, 34, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #00E676;
          border-radius: 50%;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .phone-btn:hover {
          transform: scale(1.08);
          border-color: #00E676;
        }

        @media (max-width: 768px) {
          .floating-contact-container {
            bottom: calc(88px + env(safe-area-inset-bottom, 0px));
            right: 16px;
            gap: 8px;
          }
          .whatsapp-label {
            display: none;
          }
          .whatsapp-btn {
            padding: 9px;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            justify-content: center;
          }
          .phone-btn {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </>
  );
}
