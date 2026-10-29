'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Home, 
  CalendarPlus, 
  Ticket, 
  User, 
  ShieldCheck, 
  LogOut, 
  Phone, 
  MessageCircle, 
  Clock, 
  X,
  Sparkles 
} from 'lucide-react';
import WelcomeModal from '@/components/WelcomeModal';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);

  // Do not render inside admin dashboard to prevent UI collisions
  if (pathname.startsWith('/admin')) return null;

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const isHome = pathname === '/';
  const isBook = pathname === '/book';
  const isDashboard = pathname === '/dashboard';

  const handleBookingsClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      setShowWelcome(true);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      setShowWelcome(true);
    } else {
      setShowProfileSheet(!showProfileSheet);
    }
  };

  return (
    <>
      {/* iOS Liquid Glass Floating Bottom Dock (Logos Only, No Text) */}
      <nav
        className="ios-liquid-dock"
        aria-label="Mobile Navigation Dock"
      >
        <div className="dock-liquid-glass">
          {/* 1. Home Logo (Filled with white when active) */}
          <Link
            href="/"
            className={`dock-bubble ${isHome ? 'active' : ''}`}
            aria-label="Home"
            title="Home"
          >
            <Home 
              size={22} 
              fill={isHome ? '#FFFFFF' : 'none'} 
              color={isHome ? '#FFFFFF' : 'currentColor'} 
              strokeWidth={isHome ? 2.2 : 2} 
            />
          </Link>

          {/* 2. Book a Slot Logo */}
          <Link
            href="/book"
            className={`dock-bubble ${isBook ? 'active' : ''}`}
            aria-label="Book a Slot"
            title="Book a Slot"
          >
            <CalendarPlus 
              size={22} 
              fill={isBook ? '#FFFFFF' : 'none'} 
              color={isBook ? '#FFFFFF' : 'currentColor'} 
              strokeWidth={isBook ? 2.2 : 2} 
            />
          </Link>

          {/* 3. Bookings Logo (Upcoming & Past Matches) */}
          <Link
            href="/dashboard"
            onClick={handleBookingsClick}
            className={`dock-bubble ${isDashboard && !showProfileSheet ? 'active' : ''}`}
            aria-label="My Bookings"
            title="My Bookings"
          >
            <Ticket 
              size={22} 
              fill={isDashboard && !showProfileSheet ? '#FFFFFF' : 'none'} 
              color={isDashboard && !showProfileSheet ? '#FFFFFF' : 'currentColor'} 
              strokeWidth={isDashboard ? 2.2 : 2} 
            />
          </Link>

          {/* 4. Profile Logo */}
          <button
            type="button"
            onClick={handleProfileClick}
            className={`dock-bubble ${showProfileSheet ? 'active' : ''}`}
            aria-label="Player Profile"
            title="Player Profile"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="dock-avatar-img"
              />
            ) : (
              <User 
                size={22} 
                fill={showProfileSheet ? '#FFFFFF' : 'none'} 
                color={showProfileSheet ? '#FFFFFF' : 'currentColor'} 
                strokeWidth={showProfileSheet ? 2.2 : 2} 
              />
            )}
          </button>
        </div>
      </nav>

      {/* iOS Liquid Glass Profile Drawer Sheet */}
      {showProfileSheet && session && (
        <div 
          className="ios-sheet-backdrop"
          onClick={() => setShowProfileSheet(false)}
        >
          <div 
            className="ios-profile-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="sheet-pill-handle" />

            {/* Profile Header */}
            <div className="sheet-profile-header">
              <div className="sheet-avatar-wrap">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="sheet-avatar"
                  />
                ) : (
                  <div className="sheet-avatar-fallback">
                    {session.user?.name ? session.user.name.charAt(0).toUpperCase() : <User size={20} />}
                  </div>
                )}
                <span className="sheet-online-dot" />
              </div>

              <div className="sheet-profile-info">
                <div className="sheet-user-name">{session.user?.name || 'Verified Player'}</div>
                <div className="sheet-user-email">{session.user?.email}</div>
              </div>

              <button
                type="button"
                onClick={() => setShowProfileSheet(false)}
                className="sheet-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="sheet-actions-list">
              <Link
                href="/dashboard"
                onClick={() => setShowProfileSheet(false)}
                className="sheet-action-item highlight"
              >
                <Ticket size={18} />
                <div className="action-item-text">
                  <span className="item-title">Active Matches</span>
                  <span className="item-sub">View upcoming fixtures &amp; tickets</span>
                </div>
              </Link>

              <Link
                href="/dashboard?view=profile"
                onClick={() => setShowProfileSheet(false)}
                className="sheet-action-item"
              >
                <User size={18} color="#00E5FF" />
                <div className="action-item-text">
                  <span className="item-title" style={{ color: '#00E5FF' }}>Profile &amp; History</span>
                  <span className="item-sub">Match history &amp; cancelled bookings</span>
                </div>
              </Link>

              <Link
                href="/book"
                onClick={() => setShowProfileSheet(false)}
                className="sheet-action-item"
              >
                <Sparkles size={18} color="#00E676" />
                <div className="action-item-text">
                  <span className="item-title">Book a Slot</span>
                  <span className="item-sub">Reserve Football or Cricket turf</span>
                </div>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setShowProfileSheet(false)}
                  className="sheet-action-item admin"
                >
                  <ShieldCheck size={18} color="#00E5FF" />
                  <div className="action-item-text">
                    <span className="item-title" style={{ color: '#00E5FF' }}>Admin Management</span>
                    <span className="item-sub">Turf slots, pricing &amp; analytics</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Dedicated Support Card */}
            <div className="sheet-support-card">
              <div className="support-card-header">
                <span className="support-title">Turf Desk &amp; Inquiries</span>
                <div className="support-badge">
                  <Clock size={12} />
                  <span>6 AM – 12 AM</span>
                </div>
              </div>

              <div className="support-actions-grid">
                <a
                  href="https://wa.me/917994786085?text=Hi,%20I%20would%20like%20to%20inquire%20about%20booking%20a%20turf%20slot%20at%20East%20Welfare%20Turf."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sheet-support-btn whatsapp"
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </a>

                <a
                  href="tel:+917994786085"
                  className="sheet-support-btn phone"
                >
                  <Phone size={16} />
                  <span>Call</span>
                </a>
              </div>
            </div>

            {/* Logout Action */}
            <button
              type="button"
              onClick={() => {
                setShowProfileSheet(false);
                signOut({ callbackUrl: '/' });
              }}
              className="sheet-logout-btn"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Sign-in Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
      />

      <style jsx>{`
        /* iOS Liquid Glass Floating Bottom Dock */
        .ios-liquid-dock {
          position: fixed;
          bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          left: 50%;
          transform: translateX(-50%);
          z-index: 998;
          pointer-events: none;
          display: flex;
          justify-content: center;
          width: 100%;
          padding: 0 16px;
        }

        .dock-liquid-glass {
          pointer-events: auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          align-items: center;
          justify-items: center;
          width: 100%;
          max-width: 320px;
          height: 60px;
          border-radius: 9999px;
          padding: 6px 8px;
          box-sizing: border-box;
          background: rgba(14, 18, 26, 0.68);
          backdrop-filter: blur(32px) saturate(220%);
          -webkit-backdrop-filter: blur(32px) saturate(220%);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 
            0 20px 48px -8px rgba(0, 0, 0, 0.75),
            0 0 0 1px rgba(255, 255, 255, 0.04),
            inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.35),
            inset 0 -1px 1px 0 rgba(0, 0, 0, 0.5);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        /* Icon-Only Bubble Touch Target */
        .dock-bubble {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 9999px;
          color: rgba(255, 255, 255, 0.52);
          text-decoration: none;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          box-sizing: border-box;
          line-height: 0;
          vertical-align: middle;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          -webkit-tap-highlight-color: transparent;
          position: relative;
        }

        .dock-bubble:active {
          transform: scale(0.88);
        }

        .dock-bubble.active {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(255, 255, 255, 0.28);
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.2),
            inset 0 1px 1px rgba(255, 255, 255, 0.35);
        }

        .dock-avatar-img {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          box-sizing: border-box;
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          margin: 0 auto;
          transition: border-color 0.2s ease;
        }

        .dock-bubble.active .dock-avatar-img {
          border-color: #FFFFFF;
        }

        /* iOS Profile Sheet */
        .ios-sheet-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px));
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ios-profile-sheet {
          background: rgba(14, 18, 26, 0.96);
          backdrop-filter: blur(36px) saturate(220%);
          -webkit-backdrop-filter: blur(36px) saturate(220%);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 28px;
          margin: 0 16px;
          padding: 16px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
          animation: sheetSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes sheetSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .sheet-pill-handle {
          width: 36px;
          height: 4px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 9999px;
          align-self: center;
          margin-bottom: -4px;
        }

        .sheet-profile-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sheet-avatar-wrap {
          position: relative;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
        }

        .sheet-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid #00E676;
        }

        .sheet-avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #00E676 0%, #00B0FF 100%);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
        }

        .sheet-online-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #00E676;
          border: 2px solid #0E121A;
        }

        .sheet-profile-info {
          min-width: 0;
          flex: 1;
        }

        .sheet-user-name {
          font-size: 0.98rem;
          font-weight: 800;
          color: #FFFFFF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sheet-user-email {
          font-size: 0.76rem;
          color: #94A3B8;
          font-family: var(--font-mono);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sheet-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .sheet-actions-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sheet-action-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #E2E8F0;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .sheet-action-item.highlight {
          border-color: rgba(0, 230, 118, 0.25);
          background: rgba(0, 230, 118, 0.06);
          color: #00E676;
        }

        .action-item-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .item-title {
          font-size: 0.86rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .item-sub {
          font-size: 0.72rem;
          color: #94A3B8;
        }

        /* Support Card Inside Profile Sheet */
        .sheet-support-card {
          background: rgba(0, 230, 118, 0.04);
          border: 1px solid rgba(0, 230, 118, 0.16);
          border-radius: 14px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .support-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .support-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: #FFFFFF;
        }

        .support-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: #00E676;
          font-weight: 600;
        }

        .support-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .sheet-support-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .sheet-support-btn.whatsapp {
          background: rgba(37, 211, 102, 0.15);
          border: 1px solid rgba(37, 211, 102, 0.35);
          color: #25D366;
        }

        .sheet-support-btn.phone {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #FFFFFF;
        }

        .sheet-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.25);
          color: #FF6B6B;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
        }

        @media (min-width: 769px) {
          .ios-liquid-dock {
            display: none !important;
          }
          .ios-sheet-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
