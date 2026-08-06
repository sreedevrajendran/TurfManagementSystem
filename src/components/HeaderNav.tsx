'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Calendar, 
  Sparkles,
  ChevronDown,
  Phone,
  Flame
} from 'lucide-react';
import WelcomeModal from '@/components/WelcomeModal';

export default function HeaderNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Don't render on admin dashboard itself to allow full admin workspace
  if (pathname.startsWith('/admin')) return null;

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          padding: scrolled ? '10px 20px' : '18px 24px',
          background: scrolled 
            ? 'rgba(7, 7, 9, 0.85)' 
            : 'linear-gradient(180deg, rgba(7, 7, 9, 0.8) 0%, transparent 100%)',
          backdropFilter: scrolled ? 'blur(16px)' : 'blur(4px)',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'blur(4px)',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 230, 118, 0.4)',
                fontWeight: 900,
                color: '#000000',
                fontSize: '1.2rem',
                letterSpacing: '-1px',
              }}
            >
              ⚽
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>EAST WELFARE</span>
                <span
                  style={{
                    background: '#00E676',
                    color: '#000',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    letterSpacing: '1px',
                  }}
                >
                  TURF
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94A3B8',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '1px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#00E676',
                    display: 'inline-block',
                    boxShadow: '0 0 6px #00E676',
                  }}
                />
                MANNAR • 6-A-SIDE &amp; CRICKET
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links (Homepage anchors) */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
            }}
            className="desktop-nav"
          >
            {pathname === '/' ? (
              <>
                <a href="#sports" className="nav-link">Sports</a>
                <a href="#slots-preview" className="nav-link">Live Slots</a>
                <a href="#specs" className="nav-link">Specs &amp; Lights</a>
                <a href="#pricing" className="nav-link">Pricing</a>
                <a href="#reviews" className="nav-link">Reviews</a>
                <a href="#faq" className="nav-link">FAQ</a>
              </>
            ) : (
              <>
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/book" className="nav-link">Book Pitch</Link>
                {session && <Link href="/dashboard" className="nav-link">My Dashboard</Link>}
              </>
            )}
          </nav>

          {/* Right Action Cluster */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {/* Book Now Button */}
            {pathname !== '/book' && (
              <Link
                href="/book"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  padding: '10px 22px',
                  borderRadius: '99px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(0, 230, 118, 0.35)',
                  transition: 'all 0.2s',
                  letterSpacing: '0.2px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 230, 118, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 230, 118, 0.35)';
                }}
              >
                <Calendar size={16} />
                <span>Book Slot</span>
              </Link>
            )}

            {/* Auth Button or User Menu */}
            {session ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '8px 16px',
                    borderRadius: '99px',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#00E676',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                    }}
                  >
                    {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hide-mobile" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={14} color="#94A3B8" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '220px',
                      background: '#13151D',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      padding: '8px',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(16px)',
                      zIndex: 110,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session.user?.name || 'Player'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session.user?.email}
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={16} color="#00E676" />
                      My Bookings &amp; Pass
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          color: '#00E5FF',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <ShieldCheck size={16} />
                        Admin Command
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        color: '#FF6B6B',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowWelcomeModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  borderRadius: '99px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(0, 230, 118, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                }}
              >
                <Sparkles size={15} color="#00E676" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-toggle-btn"
              aria-label="Toggle navigation menu"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Sheet */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '24px 16px',
              background: '#0D0E14',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              marginTop: '12px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {pathname === '/' ? (
              <>
                <a href="#sports" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">⚽ Sports &amp; Pitches</a>
                <a href="#slots-preview" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">⚡ Live Slot Availability</a>
                <a href="#specs" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">💡 Stadium Lights &amp; Specs</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">💵 Pricing &amp; Offers</a>
                <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">⭐ Player Reviews</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">❓ FAQ</a>
              </>
            ) : (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">🏠 Home</Link>
                <Link href="/book" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">⚽ Book Slot</Link>
                {session && <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">📊 My Dashboard</Link>}
              </>
            )}

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary"
                style={{ width: '100%', textAlign: 'center' }}
              >
                ⚽ Book Your Slot Now
              </Link>
              {!session && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowWelcomeModal(true);
                  }}
                  className="btn-secondary"
                  style={{ width: '100%' }}
                >
                  <Sparkles size={16} color="#00E676" /> Sign In with Google
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

      <style jsx global>{`
        .nav-link {
          color: #94A3B8;
          font-size: 0.92rem;
          font-weight: 600;
          transition: color 0.2s ease;
          text-decoration: none;
        }
        .nav-link:hover {
          color: #00E676;
        }
        .mobile-nav-link {
          color: #E2E8F0;
          font-size: 1.05rem;
          font-weight: 700;
          padding: 8px 12px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .mobile-nav-link:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #00E676;
        }
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: flex !important;
          }
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
