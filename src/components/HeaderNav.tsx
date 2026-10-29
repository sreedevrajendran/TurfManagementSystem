'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
  User, 
  LogOut, 
  Calendar, 
  ChevronDown,
  Terminal,
  ShieldCheck,
  Menu,
  X,
  Radio
} from 'lucide-react';
import WelcomeModal from '@/components/WelcomeModal';

export default function HeaderNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Smart Scroll: Hide on scroll down, show on scroll up, show at top, show at scroll end
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      setScrolled(currentScrollY > 20);

      // Condition 1: At the very top
      const isTop = currentScrollY < 25;
      
      // Condition 2: At or near the bottom/end of the page
      const isScrollEnd = windowHeight + currentScrollY >= documentHeight - 60;

      if (isTop || isScrollEnd) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 70) {
        // Scrolling down -> hide navbar
        setVisible(false);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> reveal navbar
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close menus on route navigation
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Hide on admin panel and dashboard for max operational workspace
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) return null;

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <>
      {/* Outer Fixed Floating Island Shell */}
      <header
        className={`floating-navbar-shell ${visible ? 'is-visible' : 'is-hidden'} ${scrolled ? 'is-scrolled' : ''}`}
        aria-label="Main Navigation"
      >
        <div className="pill-navbar">
          {/* Brand & Developer Telemetry */}
          <div className="brand-group">
            <Link href="/" className="brand-link">
              <span className="brand-title">
                EAST WELFARE <span className="brand-accent">TURF</span>
              </span>
            </Link>

            {/* Developer Telemetry Badge */}
            <div className="telemetry-badge" title="Turf Live System Status">
              <span className="telemetry-dot" />
              <span className="telemetry-label">SYS_ACTIVE</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav-links">
            {pathname === '/' ? (
              <>
                <a href="#slots-preview" className="nav-item">
                  <span className="nav-index">01/</span>Slots
                </a>
                <a href="#specs" className="nav-item">
                  <span className="nav-index">02/</span>Specs
                </a>
                <a href="#pricing" className="nav-item">
                  <span className="nav-index">03/</span>Pricing
                </a>
                <a href="#faq" className="nav-item">
                  <span className="nav-index">04/</span>Rules
                </a>
              </>
            ) : (
              <>
                <Link href="/" className="nav-item">
                  <span className="nav-index">01/</span>Home
                </Link>
                <Link href="/book" className="nav-item active">
                  <span className="nav-index">02/</span>Book Pitch
                </Link>
                {session && (
                  <Link href="/dashboard" className="nav-item">
                    <span className="nav-index">03/</span>Passes
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Cluster */}
          <div className="action-cluster">
            {/* CTA Button: Book Slot */}
            {pathname !== '/book' && (
              <Link href="/book" className="cta-book-btn">
                <Calendar size={15} />
                <span>Book Slot</span>
              </Link>
            )}

            {/* User Session Profile / Sign In */}
            {session ? (
              <div className="profile-container">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="profile-pill-btn"
                  aria-label="User menu"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="avatar-frame">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'Player'}
                        className="avatar-img"
                      />
                    ) : (
                      <div className="avatar-fallback">
                        {session.user?.name ? session.user.name.charAt(0).toUpperCase() : <User size={14} />}
                      </div>
                    )}
                    <span className="avatar-status-dot" />
                  </div>

                  <span className="user-short-name">
                    {session.user?.name?.split(' ')[0] || 'Player'}
                  </span>

                  <ChevronDown
                    size={14}
                    className={`dropdown-chevron ${userDropdownOpen ? 'open' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="user-menu-dropdown">
                    <div className="menu-header">
                      <div className="menu-user-name">{session.user?.name || 'Verified Player'}</div>
                      <div className="menu-user-email">{session.user?.email}</div>
                    </div>

                    <div className="menu-items">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="menu-link primary"
                      >
                        <User size={15} />
                        <span>My Bookings &amp; Passes</span>
                      </Link>

                      <Link
                        href="/book"
                        onClick={() => setUserDropdownOpen(false)}
                        className="menu-link"
                      >
                        <Calendar size={15} />
                        <span>Book Another Slot</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="menu-link admin"
                        >
                          <ShieldCheck size={15} />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <div className="menu-separator" />

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="menu-link logout"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowWelcomeModal(true)}
                className="signin-pill-btn"
              >
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Sheet Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-trigger"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Sheet */}
        {mobileMenuOpen && (
          <div className="mobile-sheet">
            {session ? (
              <div className="mobile-user-card">
                <div className="mobile-user-info">
                  <div className="mobile-user-name">{session.user?.name || 'Player'}</div>
                  <div className="mobile-user-email">{session.user?.email}</div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-passes-btn"
                >
                  My Passes →
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowWelcomeModal(true);
                }}
                className="mobile-signin-btn"
              >
                Sign In with Google
              </button>
            )}

            <div className="mobile-nav-group">
              {pathname === '/' ? (
                <>
                  <a href="#slots-preview" onClick={() => setMobileMenuOpen(false)} className="mobile-item">
                    Live Slots Available
                  </a>
                  <a href="#specs" onClick={() => setMobileMenuOpen(false)} className="mobile-item">
                    Pitch Specs &amp; Lighting
                  </a>
                  <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="mobile-item">
                    Pricing &amp; Offers
                  </a>
                  <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="mobile-item">
                    Rules &amp; Guidelines
                  </a>
                </>
              ) : (
                <>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mobile-item">
                    Home
                  </Link>
                  <Link href="/book" onClick={() => setMobileMenuOpen(false)} className="mobile-item">
                    Book Pitch
                  </Link>
                  {session && (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-item">
                      My Dashboard
                    </Link>
                  )}
                </>
              )}
            </div>

            <div className="mobile-footer-actions">
              <Link
                href="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-book-cta"
              >
                Instant Slot Booking
              </Link>
              {session && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="mobile-logout-btn"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              )}
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
        /* Floating Navbar Shell */
        .floating-navbar-shell {
          position: fixed;
          top: 14px;
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

        .floating-navbar-shell.is-visible {
          transform: translateY(0);
          opacity: 1;
        }

        .floating-navbar-shell.is-hidden {
          transform: translateY(-130%);
          opacity: 0;
        }

        /* Pill Container (Software Engineered Cut & Chamfer) */
        .pill-navbar {
          pointer-events: auto;
          width: 100%;
          max-width: 1060px;
          height: 54px;
          border-radius: 9999px;
          padding: 0 8px 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(9, 11, 16, 0.78);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 16px 36px -10px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(0, 230, 118, 0.08),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.14);
          transition: border-color 0.25s ease, background 0.25s ease;
        }

        .floating-navbar-shell.is-scrolled .pill-navbar {
          background: rgba(8, 10, 15, 0.88);
          border-color: rgba(255, 255, 255, 0.16);
          box-shadow: 
            0 20px 42px -10px rgba(0, 0, 0, 0.88),
            0 0 20px rgba(0, 230, 118, 0.12),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.18);
        }

        /* Brand & Telemetry */
        .brand-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-link {
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        .brand-title {
          font-family: var(--font-display, sans-serif);
          font-size: 0.96rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #FFFFFF;
          text-transform: uppercase;
        }

        .brand-accent {
          color: var(--primary-accent, #00E676);
        }

        .telemetry-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          border-radius: 9999px;
          background: rgba(0, 230, 118, 0.08);
          border: 1px solid rgba(0, 230, 118, 0.2);
        }

        .telemetry-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00E676;
          box-shadow: 0 0 8px #00E676;
          animation: pulseDot 2s infinite ease-in-out;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .telemetry-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          font-weight: 700;
          color: #A7F3D0;
          letter-spacing: 0.06em;
        }

        /* Desktop Nav Items */
        .desktop-nav-links {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .nav-item {
          color: #94A3B8;
          font-size: 0.84rem;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-index {
          font-family: var(--font-mono, monospace);
          font-size: 0.7rem;
          color: #475569;
          font-weight: 500;
        }

        .nav-item:hover {
          color: #FFFFFF;
        }

        .nav-item:hover .nav-index {
          color: var(--primary-accent, #00E676);
        }

        .nav-item.active {
          color: var(--primary-accent, #00E676);
        }

        /* Action Cluster */
        .action-cluster {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cta-book-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--primary-accent, #00E676);
          color: #000000;
          font-weight: 800;
          font-size: 0.82rem;
          letter-spacing: 0.02em;
          padding: 8px 16px;
          border-radius: 9999px;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(0, 230, 118, 0.35);
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .cta-book-btn:hover {
          background: var(--primary-accent-hover, #00FF85);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 230, 118, 0.5);
        }

        /* Profile Button */
        .profile-container {
          position: relative;
        }

        .profile-pill-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 4px 12px 4px 5px;
          border-radius: 9999px;
          color: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .profile-pill-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .avatar-frame {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--primary-accent, #00E676);
        }

        .avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #00E676 0%, #00B0FF 100%);
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .avatar-status-dot {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00E676;
          border: 1.5px solid #090B10;
        }

        .user-short-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #F1F5F9;
        }

        .dropdown-chevron {
          color: #94A3B8;
          transition: transform 0.2s ease;
        }

        .dropdown-chevron.open {
          transform: rotate(180deg);
        }

        /* Sign In Pill */
        .signin-pill-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #FFFFFF;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 7px 16px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .signin-pill-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(0, 230, 118, 0.4);
        }

        /* User Dropdown */
        .user-menu-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 230px;
          background: #0F121B;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          z-index: 1050;
        }

        .menu-header {
          padding: 8px 10px 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .menu-user-name {
          font-size: 0.86rem;
          font-weight: 800;
          color: #FFFFFF;
        }

        .menu-user-email {
          font-size: 0.72rem;
          color: #94A3B8;
          font-family: var(--font-mono, monospace);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-top: 2px;
        }

        .menu-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 6px;
        }

        .menu-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          color: #E2E8F0;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.15s ease;
        }

        .menu-link:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .menu-link.primary {
          color: #00E676;
        }

        .menu-link.admin {
          color: #00E5FF;
        }

        .menu-link.logout {
          color: #FF6B6B;
        }

        .menu-separator {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 4px 0;
        }

        /* Mobile Menu Trigger Button */
        .mobile-menu-trigger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
          cursor: pointer;
        }

        /* Mobile Sheet */
        .mobile-sheet {
          pointer-events: auto;
          width: 100%;
          max-width: 500px;
          background: rgba(12, 14, 20, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          margin-top: 8px;
          padding: 16px;
          backdrop-filter: blur(24px);
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.85);
        }

        .mobile-user-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(0, 230, 118, 0.08);
          border: 1px solid rgba(0, 230, 118, 0.2);
        }

        .mobile-user-name {
          font-size: 0.88rem;
          font-weight: 800;
          color: #FFFFFF;
        }

        .mobile-user-email {
          font-size: 0.72rem;
          color: #94A3B8;
          font-family: var(--font-mono, monospace);
        }

        .mobile-passes-btn {
          font-size: 0.78rem;
          font-weight: 700;
          color: #00E676;
          text-decoration: none;
        }

        .mobile-signin-btn {
          width: 100%;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .mobile-nav-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-item {
          padding: 8px 12px;
          border-radius: 8px;
          color: #E2E8F0;
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s ease;
        }

        .mobile-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #00E676;
        }

        .mobile-footer-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 12px;
        }

        .mobile-book-cta {
          width: 100%;
          text-align: center;
          padding: 10px;
          border-radius: 12px;
          background: var(--primary-accent, #00E676);
          color: #000000;
          font-weight: 800;
          font-size: 0.86rem;
          text-decoration: none;
        }

        .mobile-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 9px;
          border-radius: 10px;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.25);
          color: #FF6B6B;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
        }

        /* Breakpoints */
        @media (max-width: 820px) {
          .desktop-nav-links {
            display: none !important;
          }
          .mobile-menu-trigger {
            display: flex !important;
          }
          .user-short-name {
            display: none;
          }
          .telemetry-badge {
            display: none;
          }
          .pill-navbar {
            height: 48px;
            padding: 0 6px 0 14px;
          }
        }
      `}</style>
    </>
  );
}
