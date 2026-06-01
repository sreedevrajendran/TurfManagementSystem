'use client';

import { useState, useEffect, useRef } from 'react';
import { Tag, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type Offer = { id: string; startDate: string; discountPct: number; fixedPrice: number | null; slotType: string; title: string };
type Block = { id: string; date: string; startTime: number; durationHours: number; reason: string };

type TickerItem = { id: string; href: string; content: React.ReactNode; isUrgent: boolean };

export default function AlertBanner() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/offers').then(r => r.json()).then(setOffers).catch(() => {});
    fetch('/api/blocks').then(r => r.json()).then(setBlocks).catch(() => {});
  }, []);

  const todayStr = new Date().toDateString();
  const todayBlocks = blocks.filter(b => new Date(b.date).toDateString() === todayStr);
  const hasUrgent = todayBlocks.length > 0;

  if (offers.length === 0 && todayBlocks.length === 0) return null;

  // Build ticker items
  const items: TickerItem[] = [];

  todayBlocks.forEach(b => {
    const blockDateStr = new Date(b.date).toISOString().split('T')[0];
    const timeLabel = b.durationHours === 24
      ? 'Turf is closed today'
      : `Closed ${b.startTime % 12 || 12}${b.startTime >= 12 ? 'PM' : 'AM'} – ${(b.startTime + b.durationHours) % 12 || 12}${(b.startTime + b.durationHours) >= 12 ? 'PM' : 'AM'}`;
    items.push({
      id: b.id,
      href: `/book?date=${blockDateStr}`,
      isUrgent: true,
      content: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={13} color="#fca5a5" style={{ flexShrink: 0 }} />
          <span style={{ color: '#fca5a5', fontWeight: 800 }}>URGENT:</span>
          <span>{timeLabel} — {b.reason}</span>
        </span>
      ),
    });
  });

  offers.forEach(offer => {
    const isUpcoming = new Date(offer.startDate).getTime() > new Date().setHours(23, 59, 59, 999);
    const offerDateStr = new Date(offer.startDate).toISOString().split('T')[0];
    const slotLabel = offer.slotType === 'PEAK' ? ' (Night)' : offer.slotType === 'OFF_PEAK' ? ' (Day)' : '';

    let priceText: string;
    if (offer.fixedPrice !== null && offer.fixedPrice !== undefined) {
      const relevantBase = offer.slotType === 'OFF_PEAK' ? 800 : 1100;
      const savedPct = Math.round(((relevantBase - offer.fixedPrice) / relevantBase) * 100);
      priceText = savedPct > 0
        ? `₹${offer.fixedPrice}/hr (${savedPct}% OFF)`
        : `₹${offer.fixedPrice}/hr flat`;
    } else {
      priceText = `${offer.discountPct}% OFF`;
    }

    items.push({
      id: offer.id,
      href: `/book?date=${offerDateStr}`,
      isUrgent: false,
      content: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tag size={13} color="#fde047" style={{ flexShrink: 0 }} />
          <span style={{ color: '#fde047', fontWeight: 800 }}>{isUpcoming ? 'UPCOMING' : 'ACTIVE'}:</span>
          <span>{priceText}{slotLabel} — {offer.title}</span>
        </span>
      ),
    });
  });

  if (items.length === 0) return null;

  // Separator bullet between items
  const separator = (
    <span style={{ margin: '0 28px', opacity: 0.5, fontSize: '1.1rem' }}>●</span>
  );

  // Build one full track of items, separated
  const track = items.map((item, i) => (
    <span key={item.id} style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
      <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {item.content}
      </Link>
      {separator}
    </span>
  ));

  // Scroll speed: ~80px per second. Wider content = longer duration.
  // We estimate ~220px per item as a rough average.
  const estimatedWidth = items.length * 260;
  const durationSec = Math.max(8, estimatedWidth / 120);

  const bg = hasUrgent
    ? 'linear-gradient(90deg, #b91c1c, #991b1b)'
    : 'linear-gradient(90deg, #ea580c, #c2410c)';

  return (
    <div style={{
      width: '100%',
      background: bg,
      color: 'white',
      height: 36,
      overflow: 'hidden',
      position: 'relative',
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
      display: 'flex',
      alignItems: 'center',
    }}>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          animation: ticker-scroll ${durationSec}s linear infinite;
          font-size: 0.83rem;
          font-weight: 600;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* The track is rendered twice side-by-side so the loop is seamless */}
      <div className="ticker-track">
        {track}
        {track}
      </div>
    </div>
  );
}
