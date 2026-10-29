'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
  User, 
  LogOut, 
  Calendar, 
  ShieldCheck, 
  Menu, 
  X, 
  Phone, 
  MessageCircle,
  Ticket,
  Clock,
  Sparkles
} from 'lucide-react';
import WelcomeModal from '@/components/WelcomeModal';

export default function HeaderNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Smart Scroll: Hide on scroll down, show on scroll up, show at top, show at scroll end
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      setScrolled(currentScrollY > 15);

      const isTop = currentScrollY < 25;
      const isScrollEnd = windowHeight + currentScrollY >= documentHeight - 60;

      if (isTop || isScrollEnd) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 70) {
        // Scrolling down -> hide navbar
        setVisible(false);
        setMenuOpen(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> reveal navbar
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close menu on route navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Hide on admin panel to keep workspace focused
  if (pathname.startsWith('/admin')) return null;

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <>
      {/* iPhone Dynamic Island Style Top Header */}
      <header
        className={`iphone-header-shell ${visible ? 'is-visible' : 'is-hidden'} ${scrolled ? 'is-scrolled' : ''}`}
        aria-label="Main Navigation"
      >
        <div className="iphone-island-pill">
          {/* Brand & Live Activity Sensor Indicator */}
          <div className="brand-group">
            <Link href="/" className="brand-link" onClick={() => setMenuOpen(false)}>
              <span className="brand-title">
                EAST WELFARE <span className="brand-accent">TURF</span>
              </span>
            </Link>

            {/* iPhone Dynamic Island Sensor Dot */}
            <div className="island-status-dot" title="Turf Operational &amp; Ready">
              <span className="pulse-dot" />
            </div>
          </div>

          {/* Desktop Navigation Links (No 01/ indexing) */}
          <nav className="desktop-nav-links">
            {pathname === '/' ? (
              <>
                <a href="#slots-preview" className="nav-item">Slots</a>
                <a href="#specs" className="nav-item">Specs</a>
                <a href="#pricing" className="nav-item">Pricing</a>
                <a href="#faq" className="nav-item">Rules</a>
              </>
            ) : (
              <>
                <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
                  Home
                </Link>
                <Link href="/book" className={`nav-item ${pathname === '/book' ? 'active' : ''}`}>
                  Book a Slot
                </Link>
                {session && (
                  <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>
                    Bookings
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Cluster: Book a Slot CTA + 3-line Nav Menu */}
          <div className="action-cluster">
            {pathname !== '/book' && (
              <Link href="/book" className="desktop-book-btn">
                <Calendar size={14} />
                <span>Book a Slot</span>
              </Link>
            )}

            {/* 3-Line Nav Menu Trigger (Houses profile on web, full menu & contact support on mobile/web) */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className={`menu-trigger-btn ${menuOpen ? 'active' : ''}`}
              aria-label="Toggle navigation and profile menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Backdrop for 3-Line Menu Drawer */}
        {menuOpen && (
          <div 
            className="drawer-backdrop" 
            onClick={() => setMenuOpen(false)} 
            aria-hidden="true"
          />
        )}

        {/* 3-Line Navigation Drawer / Popover (Contains Profile + Navigation + Contact Support) */}
        {menuOpen && (
          <div className="iphone-menu-drawer">
            {/* 1. Profile Section inside 3-line Nav */}
            <div className="drawer-profile-section">
              {session ? (
                <div className="profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar-wrap">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          className="profile-avatar-img"
                        />
                      ) : (
                        <div className="profile-avatar-fallback">
                          {session.user?.name ? session.user.name.charAt(0).toUpperCase() : <User size={16} />}
                        </div>
                      )}
                      <span className="profile-online-badge" />
                    </div>
                    <div className="profile-text-meta">
                      <div className="profile-display-name">{session.user?.name || 'Verified Player'}</div>
                      <div className="profile-display-email">{session.user?.email}</div>
                    </div>
                  </div>

                  <div className="profile-quick-actions">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="profile-action-link primary"
                    >
                      <Ticket size={15} />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      href="/book"
                      onClick={() => setMenuOpen(false)}
                      className="profile-action-link"
                    >
                      <Calendar size={15} />
                      <span>Book a Slot</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="profile-action-link admin"
                      >
                        <ShieldCheck size={15} />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="profile-logout-btn"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="guest-card">
                  <div className="guest-info">
                    <div className="guest-title">Player Account</div>
                    <div className="guest-subtitle">Sign in to track your upcoming &amp; past bookings</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowWelcomeModal(true);
                    }}
                    className="guest-signin-btn"
                  >
                    <User size={15} />
                    <span>Sign In with Google</span>
                  </button>
                </div>
              )}
            </div>

            <div className="drawer-divider" />

            {/* 2. Navigation Links */}
            <div className="drawer-nav-section">
              <span className="drawer-section-label">Navigation</span>
              <div className="drawer-nav-links">
                <Link href="/" onClick={() => setMenuOpen(false)} className="drawer-nav-item">
                  Home
                </Link>
                <Link href="/book" onClick={() => setMenuOpen(false)} className="drawer-nav-item highlight">
                  <Sparkles size={14} />
                  <span>Book a Slot</span>
                </Link>
                {session && (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="drawer-nav-item">
                    <span>My Bookings</span>
                  </Link>
                )}
                <a href="/#slots-preview" onClick={() => setMenuOpen(false)} className="drawer-nav-item">
                  Live Available Slots
                </a>
                <a href="/#specs" onClick={() => setMenuOpen(false)} className="drawer-nav-item">
                  Turf Specifications
                </a>
                <a href="/#pricing" onClick={() => setMenuOpen(false)} className="drawer-nav-item">
                  Pricing &amp; Discounts
                </a>
                <a href="/#faq" onClick={() => setMenuOpen(false)} className="drawer-nav-item">
                  Rules &amp; Cancellation Policy
                </a>
              </div>
            </div>

            <div className="drawer-divider" />

            {/* 3. Appropriately Placed Contact & Support Module */}
            <div className="drawer-support-section">
              <span className="drawer-section-label">Turf Desk &amp; Support</span>
              <div className="support-card">
                <div className="support-hours">
                  <Clock size={13} color="#00E676" />
                  <span>Open 6:00 AM – 12:00 AM Daily</span>
                </div>

                <div className="support-buttons-grid">
                  <a
                    href="https://wa.me/917994786085?text=Hi,%20I%20would%20like%20to%20inquire%20about%20booking%20a%20turf%20slot%20at%20East%20Welfare%20Turf."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-btn whatsapp"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href="tel:+917994786085"
                    className="support-btn phone"
                  >
                    <Phone size={15} />
                    <span>Call Desk</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Welcome / Sign-in Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />

      <style jsx>{`
        /* iPhone Top Header Shell */
        .iphone-header-shell {
          position: fixed;
          top: 12px;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 16px;
          pointer-events: none;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
        }

        .iphone-header-shell.is-visible {
          transform: translateY(0);
          opacity: 1;
        }

        .iphone-header-shell.is-hidden {
          transform: translateY(-135%);
          opacity: 0;
        }

        /* Dynamic Island Pill Capsule */
        .iphone-island-pill {
          pointer-events: auto;
          width: 100%;
          max-width: 980px;
          height: 50px;
          border-radius: 9999px;
          padding: 0 8px 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(14, 17, 24, 0.76);
          backdrop-filter: blur(28px) saturate(210%);
          -webkit-backdrop-filter: blur(28px) saturate(210%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 16px 36px -8px rgba(0, 0, 0, 0.75),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.4);
          transition: all 0.25s ease;
        }

        .iphone-header-shell.is-scrolled .iphone-island-pill {
          background: rgba(10, 12, 18, 0.88);
          border-color: rgba(255, 255, 255, 0.16);
          box-shadow: 
            0 20px 42px -10px rgba(0, 0, 0, 0.85),
            0 0 20px rgba(0, 230, 118, 0.12),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.25);
        }

        /* Brand & Telemetry */
        .brand-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-link {
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        .brand-title {
          font-family: var(--font-sans);
          font-size: 0.92rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          color: #FFFFFF;
          text-transform: uppercase;
        }

        .brand-accent {
          color: var(--primary-accent, #00E676);
        }

        .island-status-dot {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
        }

        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00E676;
          box-shadow: 0 0 6px rgba(0, 230, 118, 0.6);
        }

        /* Desktop Nav Items (No 01/ indexing) */
        .desktop-nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-item {
          color: #94A3B8;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.18s ease;
          letter-spacing: -0.01em;
        }

        .nav-item:hover {
          color: #FFFFFF;
        }

        .nav-item.active {
          color: var(--primary-accent, #00E676);
          font-weight: 700;
        }

        /* Action Cluster */
        .action-cluster {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Professional Apple / Linear style Book a Slot CTA */
        .desktop-book-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #FFFFFF;
          font-weight: 600;
          font-size: 0.81rem;
          letter-spacing: -0.01em;
          padding: 7px 15px;
          border-radius: 9999px;
          text-decoration: none;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .desktop-book-btn:hover {
          background: #FFFFFF;
          color: #000000;
          border-color: #FFFFFF;
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(255, 255, 255, 0.22);
        }

        /* 3-Line Nav Menu Trigger */
        .menu-trigger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .menu-trigger-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .menu-trigger-btn.active {
          background: var(--primary-accent, #00E676);
          color: #000000;
          border-color: var(--primary-accent, #00E676);
        }

        /* Fixed Drawer Backdrop to prevent click-through & bleed */
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1005;
          pointer-events: auto;
          animation: backdropFade 0.2s ease;
        }

        @keyframes backdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* iPhone Menu Drawer (Solid Opaque High-End Glass) */
        .iphone-menu-drawer {
          position: relative;
          z-index: 1010;
          pointer-events: auto;
          width: 100%;
          max-width: 420px;
          background: #0B0E15;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 24px;
          margin-top: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 
            0 28px 70px rgba(0, 0, 0, 0.95),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
          animation: slideDownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Profile Inside 3-line Nav */
        .drawer-profile-section {
          width: 100%;
        }

        .profile-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 12px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .profile-avatar-wrap {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .profile-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--primary-accent, #00E676);
        }

        .profile-avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #00E676 0%, #00B0FF 100%);
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.95rem;
        }

        .profile-online-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #00E676;
          border: 1.5px solid #0E1118;
        }

        .profile-text-meta {
          min-width: 0;
          flex: 1;
        }

        .profile-display-name {
          font-size: 0.9rem;
          font-weight: 800;
          color: #FFFFFF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-display-email {
          font-size: 0.74rem;
          color: #94A3B8;
          font-family: var(--font-mono);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-quick-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
        }

        .profile-action-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          color: #E2E8F0;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s ease;
        }

        .profile-action-link:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .profile-action-link.primary {
          color: #00E676;
        }

        .profile-action-link.admin {
          color: #00E5FF;
        }

        .profile-logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          color: #FF6B6B;
          font-size: 0.82rem;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.15s ease;
        }

        .profile-logout-btn:hover {
          background: rgba(255, 107, 107, 0.1);
        }

        /* Guest Card */
        .guest-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .guest-title {
          font-size: 0.88rem;
          font-weight: 800;
          color: #FFFFFF;
        }

        .guest-subtitle {
          font-size: 0.76rem;
          color: #94A3B8;
        }

        .guest-signin-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.84rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .guest-signin-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(0, 230, 118, 0.5);
        }

        .drawer-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }

        .drawer-section-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748B;
          margin-bottom: 6px;
          display: block;
        }

        /* Navigation Links in Drawer */
        .drawer-nav-section {
          display: flex;
          flex-direction: column;
        }

        .drawer-nav-links {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .drawer-nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 8px;
          color: #CBD5E1;
          font-size: 0.84rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .drawer-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #FFFFFF;
        }

        .drawer-nav-item.highlight {
          color: var(--primary-accent, #00E676);
        }

        /* Appropriately Placed Support Module */
        .drawer-support-section {
          display: flex;
          flex-direction: column;
        }

        .support-card {
          background: rgba(0, 230, 118, 0.04);
          border: 1px solid rgba(0, 230, 118, 0.15);
          border-radius: 14px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .support-hours {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          color: #94A3B8;
        }

        .support-buttons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .support-btn {
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

        .support-btn.whatsapp {
          background: rgba(37, 211, 102, 0.14);
          border: 1px solid rgba(37, 211, 102, 0.35);
          color: #25D366;
        }

        .support-btn.whatsapp:hover {
          background: rgba(37, 211, 102, 0.25);
        }

        .support-btn.phone {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #FFFFFF;
        }

        .support-btn.phone:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        /* Responsive Breakpoints */
        @media (max-width: 820px) {
          .desktop-nav-links {
            display: none !important;
          }
          .desktop-book-btn {
            display: none !important;
          }
          .iphone-island-pill {
            height: 46px;
            padding: 0 6px 0 14px;
          }
        }
      `}</style>
    </>
  );
}
