'use client';

import { useState, useEffect } from 'react';
import { Tag, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertBanner() {
  const [offers, setOffers] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/offers').then(r => r.json()).then(setOffers).catch(() => {});
    fetch('/api/blocks').then(r => r.json()).then(setBlocks).catch(() => {});
  }, []);

  const todayStr = new Date().toDateString();
  const todayBlocks = blocks.filter(b => new Date(b.date).toDateString() === todayStr);

  if (offers.length === 0 && todayBlocks.length === 0) return null;

  return (
    <div style={{
      width: '100%',
      background: todayBlocks.length > 0 
        ? 'linear-gradient(90deg, #b91c1c, #991b1b)' 
        : 'linear-gradient(90deg, #ea580c, #c2410c)',
      color: 'white',
      padding: '8px 16px',
      fontSize: '0.85rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      zIndex: 1000,
      position: 'relative',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      textAlign: 'center',
      flexWrap: 'wrap'
    }}>
      <AnimatePresence>
        {todayBlocks.map(b => (
          <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} color="#fca5a5" />
            <span style={{ color: '#fca5a5' }}>URGENT:</span> {b.durationHours === 24 ? 'Turf is closed today' : `Turf is closed today from ${b.startTime % 12 || 12}${b.startTime >= 12 ? 'PM' : 'AM'} to ${(b.startTime + b.durationHours) % 12 || 12}${(b.startTime + b.durationHours) >= 12 ? 'PM' : 'AM'}`} — {b.reason}
          </motion.div>
        ))}
        
        {offers.map(offer => {
          const isUpcoming = new Date(offer.startDate).getTime() > new Date().setHours(23, 59, 59, 999);
          return (
            <motion.div key={offer.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={14} color="#fde047" />
              <span style={{ color: '#fde047' }}>{isUpcoming ? 'UPCOMING' : 'ACTIVE'} OFFER:</span> {offer.discountPct}% OFF {offer.slotType === 'PEAK' ? '(Night Slots)' : offer.slotType === 'OFF_PEAK' ? '(Day Slots)' : ''} — {offer.title}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
