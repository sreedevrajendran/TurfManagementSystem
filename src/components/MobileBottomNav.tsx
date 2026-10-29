'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Calendar, Ticket, User, Shield } from 'lucide-react';
import WelcomeModal from '@/components/WelcomeModal';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showWelcome, setShowWelcome] = useState(false);

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

  return (
    <>
      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile Bottom Dock"
      >
        <div className="mobile-dock-inner">
          {/* 1. Home */}
          <Link
            href="/"
            className={`dock-item ${isHome ? 'active' : ''}`}
          >
            <div className="icon-wrapper">
              <Home size={20} strokeWidth={isHome ? 2.5 : 2} />
              {isHome && <span className="active-glow-dot" />}
            </div>
            <span className="dock-label">Home</span>
          </Link>

          {/* 2. Book Slot (Hero Action) */}
          <Link
            href="/book"
            className={`dock-item book-action ${isBook ? 'active' : ''}`}
          >
            <div className="book-icon-badge">
              <Calendar size={19} strokeWidth={2.4} />
            </div>
            <span className="dock-label">Book</span>
          </Link>

          {/* 3. My Bookings / Passes */}
          <Link
            href="/dashboard"
            onClick={handleBookingsClick}
            className={`dock-item ${isDashboard ? 'active' : ''}`}
          >
            <div className="icon-wrapper">
              <Ticket size={20} strokeWidth={isDashboard ? 2.5 : 2} />
              {isDashboard && <span className="active-glow-dot" />}
            </div>
            <span className="dock-label">My Passes</span>
          </Link>

          {/* 4. Profile / Admin */}
          {isAdmin ? (
            <Link
              href="/admin"
              className="dock-item"
            >
              <div className="icon-wrapper">
                <Shield size={20} color="#00E5FF" strokeWidth={2.2} />
              </div>
              <span className="dock-label" style={{ color: '#00E5FF' }}>Admin</span>
            </Link>
          ) : session ? (
            <Link
              href="/dashboard"
              className={`dock-item ${isDashboard ? 'active' : ''}`}
            >
              <div className="icon-wrapper">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="dock-avatar"
                  />
                ) : (
                  <User size={20} strokeWidth={2} />
                )}
              </div>
              <span className="dock-label">Profile</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowWelcome(true)}
              className="dock-item"
            >
              <div className="icon-wrapper">
                <User size={20} strokeWidth={2} />
              </div>
              <span className="dock-label">Sign In</span>
            </button>
          )}
        </div>

        <WelcomeModal
          isOpen={showWelcome}
          onClose={() => setShowWelcome(false)}
        />

        <style jsx>{`
          .mobile-bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 998;
            padding: 8px 12px max(12px, env(safe-area-inset-bottom));
            background: rgba(9, 11, 16, 0.88);
            backdrop-filter: blur(24px) saturate(190%);
            -webkit-backdrop-filter: blur(24px) saturate(190%);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
          }

          .mobile-dock-inner {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            width: 100%;
            max-width: 480px;
            align-items: center;
            gap: 4px;
          }

          .dock-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 6px 4px;
            border-radius: 12px;
            color: #8E98A8;
            text-decoration: none;
            background: none;
            border: none;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            -webkit-tap-highlight-color: transparent;
          }

          .dock-item:active {
            transform: scale(0.92);
          }

          .dock-item.active {
            color: #00E676;
          }

          .icon-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
          }

          .active-glow-dot {
            position: absolute;
            bottom: -3px;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: #00E676;
            box-shadow: 0 0 8px #00E676;
          }

          .dock-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 1.5px solid #00E676;
            object-fit: cover;
          }

          .dock-label {
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            line-height: 1;
            font-family: var(--font-sans);
          }

          /* Special Accent for the central Book action */
          .dock-item.book-action .book-icon-badge {
            background: rgba(0, 230, 118, 0.12);
            border: 1px solid rgba(0, 230, 118, 0.35);
            color: #00E676;
            width: 38px;
            height: 30px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .dock-item.book-action.active .book-icon-badge {
            background: #00E676;
            color: #000000;
            border-color: #00E676;
            box-shadow: 0 0 16px rgba(0, 230, 118, 0.4);
          }

          @media (min-width: 769px) {
            .mobile-bottom-nav {
              display: none !important;
            }
          }
        `}</style>
      </nav>
    </>
  );
}
