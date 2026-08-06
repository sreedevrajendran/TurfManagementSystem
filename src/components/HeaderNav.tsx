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
          {/* Brand Wordmark - Clean Athletic Typography */}
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
                lineHeight: 1.1,
                textTransform: 'uppercase',
              }}
            >
              EAST WELFARE <span style={{ color: '#00E676' }}>TURF</span>
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: '#94A3B8',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginTop: '3px',
              }}
            >
              Mannar • Kerala
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
                  background: '#00E676',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  padding: '9px 20px',
                  borderRadius: '99px',
                  textDecoration: 'none',
                  border: '1px solid transparent',
                  transition: 'all 0.2s',
                  letterSpacing: '0.2px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.background = '#00FF85';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = '#00E676';
                }}
              >
                <Calendar size={16} />
                <span>Book Slot</span>
              </Link>
            )}

            {/* Auth Button or User Profile Icon */}
            {session ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="User profile and booking status"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '6px 14px 6px 8px',
                    borderRadius: '99px',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  {/* Profile Avatar / Photo */}
                  <div style={{ position: 'relative' }}>
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'Player'}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1.5px solid #00E676',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
                          color: '#000000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.82rem',
                          fontWeight: 900,
                        }}
                      >
                        {session.user?.name ? session.user.name.charAt(0).toUpperCase() : <User size={15} />}
                      </div>
                    )}
                    {/* Active online green dot */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        right: '-1px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#00E676',
                        border: '1.5px solid #070709',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }} className="hide-mobile">
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.1 }}>
                      {session.user?.name?.split(' ')[0] || 'Player'}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#00E676', letterSpacing: '0.3px', lineHeight: 1 }}>
                      Bookings &amp; Pass
                    </span>
                  </div>

                  <ChevronDown size={14} color="#94A3B8" style={{ transform: userDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>

                {/* Profile & Booking Status Dropdown */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: '250px',
                      background: '#11131A',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '18px',
                      padding: '10px',
                      boxShadow: '0 20px 48px rgba(0, 0, 0, 0.8)',
                      backdropFilter: 'blur(20px)',
                      zIndex: 110,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      animation: 'fadeInMenu 0.15s ease-out',
                    }}
                  >
                    {/* User Header Summary */}
                    <div style={{ padding: '8px 10px 12px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session.user?.name || 'Player'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                        {session.user?.email}
                      </div>
                    </div>

                    {/* View Booking Status / Pass */}
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: 'rgba(0, 230, 118, 0.1)',
                        border: '1px solid rgba(0, 230, 118, 0.25)',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 230, 118, 0.18)';
                        e.currentTarget.style.borderColor = '#00E676';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 230, 118, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(0, 230, 118, 0.25)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={17} color="#00E676" />
                        <span>My Booking Status</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', background: '#00E676', color: '#000', fontWeight: 900, padding: '2px 6px', borderRadius: '6px' }}>
                        PASS
                      </span>
                    </Link>

                    {/* Quick Book Slot */}
                    <Link
                      href="/book"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        color: '#E2E8F0',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Calendar size={16} color="#38BDF8" />
                      <span>Book Another Slot</span>
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
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <ShieldCheck size={16} />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        color: '#FF6B6B',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.12)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
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
            {/* Profile banner on mobile when signed in */}
            {session && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: 'rgba(0, 230, 118, 0.1)',
                  border: '1px solid rgba(0, 230, 118, 0.25)',
                  textDecoration: 'none',
                }}
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'Player'}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #00E676' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 900,
                    }}
                  >
                    {session.user?.name ? session.user.name.charAt(0).toUpperCase() : <User size={18} />}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {session.user?.name || 'Player'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#00E676', fontWeight: 700 }}>
                    View Match Pass &amp; Bookings →
                  </div>
                </div>
              </Link>
            )}

            {pathname === '/' ? (
              <>
                <a href="#slots-preview" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Live Slot Availability</a>
                <a href="#specs" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Stadium Lights &amp; Specs</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Pricing &amp; Offers</a>
                <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Player Reviews</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">FAQ &amp; Rules</a>
              </>
            ) : (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Home</Link>
                <Link href="/book" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Book Pitch</Link>
                {session && <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">My Dashboard</Link>}
              </>
            )}

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Book Your Slot Now
              </Link>
              {session ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', color: '#FF6B6B' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
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
