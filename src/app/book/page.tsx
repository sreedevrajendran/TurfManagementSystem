'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, ShieldCheck, Calendar, Sun, Moon, Sparkles, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import CustomModal from '@/components/CustomModal';
import { generateReceiptImage } from '@/lib/generateReceipt';
import { openTermsModal } from '@/components/TermsModal';

type SpecialOffer = {
  id: string;
  title: string;
  discountPct: number;
  fixedPrice: number | null;
  slotType: 'PEAK' | 'OFF_PEAK' | 'BOTH';
  startDate: string;
  endDate: string;
};

const generateDates = (days: number) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const formatTime = (hour: number) => {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:00 ${ampm}`;
};

export default function BookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [dates, setDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duration, setDuration] = useState<number>(1);
  const [sport, setSport] = useState<'FOOTBALL' | 'CRICKET'>('FOOTBALL');
  const [teamName, setTeamName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [pricing, setPricing] = useState({ offPeak: 800, peak: 1100, peakStart: 19 });

  const [customModal, setCustomModal] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'success';
    title: string;
    message: string;
    onConfirm: () => void;
    children?: React.ReactNode;
  }>({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    const generated = generateDates(5);
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    const slotParam = params.get('slot');
    const sportParam = params.get('sport');

    if (sportParam === 'CRICKET') {
      setSport('CRICKET');
    }

    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        if (!generated.some(d => d.toDateString() === parsed.toDateString())) {
          generated.push(parsed);
          generated.sort((a, b) => a.getTime() - b.getTime());
        }
        setSelectedDate(parsed);
      }
    } else {
      setSelectedDate(generated[0]);
    }
    setDates(generated);

    if (slotParam) {
      const s = parseInt(slotParam, 10);
      if (!isNaN(s)) {
        setSelectedSlot(s);
        setIsModalOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    fetch('/api/pricing', { cache: 'no-store' })
      .then(r => r.json())
      .then(p => { if (p && !p.error) setPricing(p); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch('/api/offers', { cache: 'no-store' });
        if (res.ok) setOffers(await res.json());
      } catch (e) {
        console.error('Failed to fetch offers:', e);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      setIsFetchingSlots(true);
      try {
        const dateStr = selectedDate.toISOString();
        const res = await fetch(`/api/bookings?date=${encodeURIComponent(dateStr)}`);
        if (res.ok) {
          const data = await res.json();
          setBookedSlots(data);
        }
      } catch (e) {
        console.error('Failed to fetch booked slots:', e);
      } finally {
        setIsFetchingSlots(false);
      }
    };
    fetchBookedSlots();
    fetch('/api/blocks').then(r => r.json()).then(setBlocks).catch(() => {});
  }, [selectedDate]);

  const showAlert = (title: string, message: string, type: 'alert' | 'success' = 'alert', callback?: () => void, children?: React.ReactNode) => {
    setCustomModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: () => {
        setCustomModal(prev => ({ ...prev, isOpen: false }));
        if (callback) callback();
      },
      children
    });
  };

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const getPriceForHour = (hour: number, date: Date) => {
    const isOffPeak = hour >= 6 && hour < pricing.peakStart;
    const basePrice = isOffPeak ? pricing.offPeak : pricing.peak;
    const slotType = isOffPeak ? 'OFF_PEAK' : 'PEAK';

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    let bestFixedPrice: number | null = null;
    let bestDiscount = 0;

    for (const offer of offers) {
      const start = new Date(offer.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(offer.endDate);
      end.setHours(23, 59, 59, 999);

      if (checkDate >= start && checkDate <= end) {
        if (offer.slotType === 'BOTH' || offer.slotType === slotType) {
          if (offer.fixedPrice !== null && offer.fixedPrice !== undefined) {
            if (bestFixedPrice === null || offer.fixedPrice < bestFixedPrice) {
              bestFixedPrice = offer.fixedPrice;
            }
          } else if (offer.discountPct > bestDiscount) {
            bestDiscount = offer.discountPct;
          }
        }
      }
    }

    const finalPrice = bestFixedPrice !== null
      ? bestFixedPrice
      : basePrice - (basePrice * (bestDiscount / 100));
    return { basePrice, finalPrice, discount: bestDiscount, fixedPrice: bestFixedPrice };
  };

  const calculateTotal = (startHour: number, dur: number, date: Date) => {
    let totalBase = 0;
    let totalFinal = 0;
    for (let i = 0; i < dur; i++) {
      const h = (startHour + i) % 24;
      const { basePrice, finalPrice } = getPriceForHour(h, date);
      totalBase += basePrice;
      totalFinal += finalPrice;
    }
    return { totalBase, totalFinal };
  };

  const handleSlotClick = (hour: number) => {
    if (status === 'unauthenticated') {
      signIn('google', { callbackUrl: '/book' });
      return;
    }
    setSelectedSlot(hour);
    setDuration(1);
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!teamName.trim()) {
      showAlert('Missing Info', 'Please enter your Team Name.');
      return;
    }
    if (!phoneNumber.trim()) {
      showAlert('Missing Info', 'Please enter your WhatsApp contact number.');
      return;
    }

    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const isValidPhone = digitsOnly.length === 10 || (digitsOnly.length === 12 && digitsOnly.startsWith('91'));
    if (!isValidPhone) {
      showAlert('Invalid Phone', 'Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    if (selectedSlot === null) return;
    setIsLoading(true);

    try {
      const { totalFinal } = calculateTotal(selectedSlot, duration, selectedDate);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          startTime: selectedSlot,
          durationHours: duration,
          teamName: teamName.trim(),
          phone: phoneNumber.trim(),
          amount: totalFinal,
          sport,
        }),
      });

      if (res.ok) {
        const receiptData = {
          teamName,
          sport: sport === 'CRICKET' ? 'Cricket' : 'Football',
          date: selectedDate.toLocaleDateString('en-IN'),
          time: `${formatTime(selectedSlot)} – ${formatTime((selectedSlot + duration) % 24)}`,
          duration,
          phone: phoneNumber,
          amount: totalFinal,
        };

        const handleDownloadReceipt = () => {
          const dataUrl = generateReceiptImage(receiptData);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `EastWelfareTurf_Receipt_${teamName.replace(/\s+/g, '_')}_${Date.now()}.png`;
          a.click();
        };

        const handleShareReceipt = async () => {
          const dataUrl = generateReceiptImage(receiptData);
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], `Receipt_${teamName}_${Date.now()}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: 'Booking Receipt' }).catch(() => {});
          } else {
            const text = `*East Welfare Turf Booking*\nTeam: ${teamName}\nDate: ${receiptData.date}\nTime: ${receiptData.time}\nTotal: \u20b9${totalFinal}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
          }
        };

        showAlert(
          'Match Slot Confirmed! 🏆',
          `Team: ${teamName}\nSport: ${sport === 'CRICKET' ? 'Cricket' : 'Football'}\nTime: ${formatTime(selectedSlot)} for ${duration} hour(s)\nTotal: ₹${totalFinal}\n\nPayment to be settled at the venue before kickoff.`,
          'success',
          () => {
            setIsModalOpen(false);
            setSelectedSlot(null);
            setTeamName('');
            setPhoneNumber('');

            fetch(`/api/bookings?date=${encodeURIComponent(selectedDate.toISOString())}`)
              .then(r => r.json())
              .then(data => setBookedSlots(Array.isArray(data) ? data : []))
              .catch(console.error);

            router.refresh();
          },
          (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14 }}>
              <button onClick={handleDownloadReceipt} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>Download Receipt</button>
              <button onClick={handleShareReceipt} style={{ padding: '10px 18px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>Share on WhatsApp</button>
            </div>
          )
        );
      } else {
        const err = await res.json().catch(() => ({}));
        let rawMsg = String(err.error || '');
        let cleanMsg = 'Something went wrong while confirming your booking. Please try again or contact us directly on WhatsApp.';

        if (rawMsg.includes('slot has already been booked')) {
          cleanMsg = 'This slot has already been booked by another team. Please choose another time.';
        } else if (rawMsg.includes('Cannot book slots in the past')) {
          cleanMsg = 'Cannot book slots in the past. Please select a future time slot.';
        } else if (rawMsg.includes('Invalid phone number')) {
          cleanMsg = 'Please enter a valid 10-digit WhatsApp phone number.';
        }

        showAlert(
          'Booking Unavailable',
          cleanMsg,
          'alert',
          undefined,
          (
            <div style={{ marginTop: 14 }}>
              <a
                href={`https://wa.me/919778217878?text=${encodeURIComponent(`Hi, I would like to book a slot for ${teamName || 'our team'} on ${selectedDate.toLocaleDateString('en-IN')} at ${formatTime(selectedSlot)}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#25D366',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                }}
              >
                Contact via WhatsApp
              </a>
            </div>
          )
        );
      }
    } catch (e) {
      console.error('Booking error:', e);
      showAlert('Error', 'Unable to complete reservation right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'unauthenticated') {
    return (
      <div className={styles.container}>
        <div className={styles.loginPrompt}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.loginCard}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,230,118,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#00E676' }}>
              <LogIn size={32} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8, color: '#fff' }}>Member Sign In</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Sign in with Google for instant 60-second court reservations, match receipts, and booking management.
            </p>
            <button
              onClick={() => signIn('google', { callbackUrl: '/book' })}
              className={styles.googleBtn}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // All slots in a single list
  const allSlots = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  const renderSlotGrid = (slotHours: number[]) => (
    <div className={styles.slotsGrid}>
      {slotHours.map((hour) => {
        const now = new Date();
        const selectedMidnight = new Date(selectedDate);
        selectedMidnight.setHours(0, 0, 0, 0);

        const todayMidnight = new Date(now);
        todayMidnight.setHours(0, 0, 0, 0);

        const isPastDate = selectedMidnight < todayMidnight;
        const isToday = selectedMidnight.getTime() === todayMidnight.getTime();
        const isPast = isPastDate || (isToday && hour < now.getHours());
        const isCurrentHour = isToday && hour === now.getHours();

        const blockingBlock = blocks.find((b: any) => {
          if (new Date(b.date).toDateString() !== selectedDate.toDateString()) return false;
          if (b.durationHours === 24) return true;
          return hour >= b.startTime && hour < (b.startTime + b.durationHours);
        });
        const isBlocked = !!blockingBlock;
        const isBooked = bookedSlots.includes(hour) || isBlocked;
        const isDisabled = isPast || isBooked || isFetchingSlots;
        const isPeak = hour >= pricing.peakStart;

        const { basePrice, finalPrice, discount, fixedPrice: slotFixedPrice } = getPriceForHour(hour, selectedDate);
        const hasDiscount = discount > 0;
        const hasFixedPrice = slotFixedPrice !== null && slotFixedPrice !== undefined;

        if (isPast) return null;

        return (
          <div
            key={hour}
            onClick={() => {
              if (isBlocked) {
                showAlert('Slot Blocked 🔒', `Unavailable. Reason: ${blockingBlock.reason}`);
              } else if (isBooked) {
                showAlert('Already Booked', 'This time slot has already been reserved.');
              } else if (!isDisabled) {
                handleSlotClick(hour);
              }
            }}
            className={`${styles.slot} ${
              isFetchingSlots ? styles.fetching : isBooked ? styles.booked : styles.available
            }`}
          >
            <span className={styles.timeLabel}>{formatTime(hour)}</span>
            {isCurrentHour ? (
              <span className={styles.nowTag}>LIVE NOW</span>
            ) : isBlocked ? (
              <span className={styles.priceTag} style={{ color: '#FF6B6B' }}>🔒 Blocked</span>
            ) : isBooked ? (
              <span className={styles.priceTag} style={{ color: '#94A3B8' }}>✕ Booked</span>
            ) : hasFixedPrice ? (
              <span className={styles.priceTag}>₹{slotFixedPrice}</span>
            ) : hasDiscount ? (
              <span className={styles.priceTag}>₹{finalPrice}</span>
            ) : (
              <span className={styles.priceTag}>₹{basePrice}</span>
            )}

            {!isBooked && !isBlocked && (
              <span className={styles.peakBadge}>
                {isPeak ? '★ Floodlights' : 'Daylight'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>SELECT MATCH SLOT</h1>
        <p className={styles.subtitle}>
          {isAdmin ? '🛡️ Admin Match Booking Console' : `Welcome, ${session?.user?.name?.split(' ')[0]}! Pick your preferred sport, date, and slot time.`}
        </p>
        {isAdmin && (
          <div className={styles.adminBadge}>
            <ShieldCheck size={16} /> Admin Authority
          </div>
        )}
      </header>

      {/* Sport Selector Toggle */}
      <div className={styles.sportSelector}>
        <button
          onClick={() => setSport('FOOTBALL')}
          className={`${styles.sportBtn} ${sport === 'FOOTBALL' ? styles.sportBtnActive : ''}`}
        >
          ⚽ Football
        </button>
        <button
          onClick={() => setSport('CRICKET')}
          className={`${styles.sportBtn} ${sport === 'CRICKET' ? styles.sportBtnActive : ''}`}
        >
          🏏 Cricket
        </button>
      </div>

      {/* Date Picker Ribbon */}
      <div className={styles.dateScroll}>
        {dates.map((date, idx) => (
          <div
            key={idx}
            className={`${styles.dateCard} ${selectedDate.toDateString() === date.toDateString() ? styles.dateCardSelected : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            <span className={styles.dateDay}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className={styles.dateNumber}>{date.getDate()}</span>
            <span className={styles.dateMonth}>{date.toLocaleDateString('en-US', { month: 'short' })}</span>
          </div>
        ))}
      </div>

      {/* All Slots */}
      <div className={styles.sessionGroup}>
        {renderSlotGrid(allSlots)}
      </div>

      {/* Legend */}
      <div className={styles.legendBar}>
        <div className={styles.legendItem}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: '#11131B', border: '1px solid #00E676' }} />
          <span>Available Slot</span>
        </div>
        <div className={styles.legendItem}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)' }} />
          <span>Booked</span>
        </div>
        <div className={styles.legendItem}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(255,184,0,0.2)', border: '1px solid #FFB800' }} />
          <span>Peak LED Rate</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button onClick={() => openTermsModal()} style={{ background: 'none', border: 'none', color: '#94A3B8', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>
          📜 View Booking Terms &amp; Fair Play Rules
        </button>
      </div>

      {/* Confirmation Bottom Sheet */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={styles.modalSheet}
          >
            <div className={styles.modalDragHandle} />
            <h2 className={styles.modalTitle}>Confirm Slot Booking</h2>
            <p className={styles.modalSubtitle}>
              {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })} at {formatTime(selectedSlot!)}
            </p>

            <div className={styles.inputGroup}>
              <label>Sport</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSport('FOOTBALL')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: sport === 'FOOTBALL' ? '2px solid #00E676' : '1px solid rgba(255,255,255,0.1)',
                    background: sport === 'FOOTBALL' ? 'rgba(0,230,118,0.15)' : 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ⚽ Football (6v6)
                </button>
                <button
                  type="button"
                  onClick={() => setSport('CRICKET')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: sport === 'CRICKET' ? '2px solid #00E676' : '1px solid rgba(255,255,255,0.1)',
                    background: sport === 'CRICKET' ? 'rgba(0,230,118,0.15)' : 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🏏 Cricket
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Team Name / Booking Name</label>
              <input
                type="text"
                placeholder="e.g. Central Strikers FC"
                className={styles.inputField}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Captain / Team WhatsApp Number</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                className={styles.inputField}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Duration (Hours)</label>
              <select
                className={styles.durationSelect}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={1}>1 Hour ({formatTime(selectedSlot!)} – {formatTime((selectedSlot! + 1) % 24)})</option>
                <option value={2}>2 Hours ({formatTime(selectedSlot!)} – {formatTime((selectedSlot! + 2) % 24)})</option>
                <option value={3}>3 Hours ({formatTime(selectedSlot!)} – {formatTime((selectedSlot! + 3) % 24)})</option>
              </select>
            </div>

            <div className={styles.totalSection}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Pay at venue (Cash / UPI):</span>
                <span style={{ fontSize: '0.8rem', color: '#00E676', fontWeight: 600 }}>Zero Advance Required</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                {selectedSlot !== null && (() => {
                  const { totalBase, totalFinal } = calculateTotal(selectedSlot, duration, selectedDate);
                  const hasOffer = totalFinal < totalBase;
                  return (
                    <div>
                      {hasOffer && (
                        <span style={{ color: '#94A3B8', textDecoration: 'line-through', fontSize: '0.85rem', marginRight: 6 }}>
                          ₹{totalBase}
                        </span>
                      )}
                      <strong style={{ color: '#FFFFFF', fontSize: '1.6rem', fontWeight: 900 }}>₹{totalFinal}</strong>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className={styles.confirmBtn} onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? 'Reserving...' : 'Confirm Match'}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      <CustomModal {...customModal} />
    </div>
  );
}
