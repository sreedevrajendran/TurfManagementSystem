'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      // Path just changed — hide loader (navigation complete)
      setVisible(false);
      setPrevPath(pathname);
    }
  }, [pathname, prevPath]);

  // Listen for all link clicks and show loader immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Only trigger for internal same-origin navigation
      const isInternal =
        !href.startsWith('http') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        !href.startsWith('#');

      if (isInternal) {
        setVisible(true);
      }
    };

    // Also intercept router.push via button clicks that trigger form submits / loading states
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  // Safety: always hide after 8s in case something goes wrong
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      zIndex: 99999,
      background: 'rgba(7, 7, 14, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
    }}>
      <div style={{ display: 'flex', gap: '24px', fontSize: '3rem', marginBottom: '8px' }}>
        <div style={{ animation: 'navBounce 0.6s infinite alternate cubic-bezier(0.5, 0.05, 1, 0.5)' }}>⚽</div>
        <div style={{ animation: 'navBounce 0.6s infinite alternate-reverse cubic-bezier(0.5, 0.05, 1, 0.5)', animationDelay: '0.15s' }}>🏏</div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '3px', marginTop: 20 }}>
        LOADING...
      </p>
      <style>{`
        @keyframes navBounce {
          0%   { transform: translateY(0) scale(1); }
          100% { transform: translateY(-32px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
