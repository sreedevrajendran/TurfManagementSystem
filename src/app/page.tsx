'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import {
  Calendar,
  Zap,
  ShieldCheck,
  Trophy,
  Clock,
  MapPin,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Sun,
  Moon,
  Flame,
  ArrowRight,
  Phone,
  Compass,
  Activity
} from 'lucide-react';
import styles from './page.module.css';
import WelcomeModal from '@/components/WelcomeModal';
import { openTermsModal } from '@/components/TermsModal';
import { openPrivacyModal } from '@/components/PrivacyModal';

// Animation presets
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const scrollRevealSection: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardFadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HomePage() {
  const { data: session } = useSession();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [pricing, setPricing] = useState({ offPeak: 800, peak: 1100, peakStart: 19 });
  const [bookedSlotsToday, setBookedSlotsToday] = useState<number[]>([]);

  const fetchPricing = () => {
    fetch('/api/pricing', { cache: 'no-store' })
      .then((r) => r.json())
      .then((p) => {
        if (p && !p.error) setPricing(p);
      })
      .catch(() => {});
  };

  useEffect(() => {
    // Fetch pricing
    fetchPricing();

    // Auto-refresh pricing on tab visibility
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchPricing();
    };
    window.addEventListener('visibilitychange', handleVisibility);

    // Fetch today's booked slots
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/bookings?date=${today}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBookedSlotsToday(data);
      })
      .catch(() => {});

    return () => window.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const timeSlots = [
    { hour: 6, label: '6:00 AM', isPeak: false },
    { hour: 7, label: '7:00 AM', isPeak: false },
    { hour: 8, label: '8:00 AM', isPeak: false },
    { hour: 9, label: '9:00 AM', isPeak: false },
    { hour: 10, label: '10:00 AM', isPeak: false },
    { hour: 16, label: '4:00 PM', isPeak: false },
    { hour: 17, label: '5:00 PM', isPeak: false },
    { hour: 18, label: '6:00 PM', isPeak: false },
    { hour: 19, label: '7:00 PM', isPeak: true },
    { hour: 20, label: '8:00 PM', isPeak: true },
    { hour: 21, label: '9:00 PM', isPeak: true },
    { hour: 22, label: '10:00 PM', isPeak: true },
    { hour: 23, label: '11:00 PM', isPeak: true },
  ];

  const currentHour = new Date().getHours();

  return (
    <main className={styles.main}>
      {/* ── HERO SECTION ── */}
      <section className={styles.heroSection}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className={styles.heroBg}
          poster="/hero.png"
        >
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} />

        <motion.div
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Main Athletic Headline */}
          <motion.h1 variants={fadeUp} className={styles.heroTitle}>
            DOMINATE THE <span className={styles.heroHighlight}>PITCH.</span>
            <br />
            ELEVATE YOUR GAME.
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className={styles.heroSubtitle}>
            Mannar&apos;s premier athletic arena built for high-intensity Football and Box Cricket. Featuring professional stadium floodlighting and instant online reservations.
          </motion.p>

          {/* Main CTA Cluster */}
          <motion.div variants={fadeUp} className={styles.heroCtaCluster}>
            <Link href="/book" className={styles.heroCtaPrimary}>
              <Calendar size={20} />
              <span>Book Your Slot Now</span>
            </Link>

            {session ? (
              <Link href="/dashboard" className={styles.heroCtaSecondary}>
                <Trophy size={18} color="#00E676" />
                <span>My Player Pass</span>
              </Link>
            ) : (
              <button
                onClick={() => setShowWelcomeModal(true)}
                className={styles.heroCtaSecondary}
              >
                <span>Quick Sign In</span>
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className={styles.scrollDownIndicator}>
          <span>Explore Pitch</span>
          <div className={styles.scrollDownLine} />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={cardStagger}
        className={styles.statsBar}
      >
        <div className={styles.statsGrid}>
          <motion.div variants={cardFadeUp} className={styles.statCard}>
            <span className={styles.statNumber}>4.9 ★</span>
            <span className={styles.statLabel}>Player Rating</span>
            <span className={styles.statSub}>150+ Verified Reviews</span>
          </motion.div>

          <motion.div variants={cardFadeUp} className={styles.statCard}>
            <span className={styles.statNumber}>24 / 7</span>
            <span className={styles.statLabel}>Match Ready</span>
            <span className={styles.statSub}>Daylight &amp; Night Floodlights</span>
          </motion.div>

          <motion.div variants={cardFadeUp} className={styles.statCard}>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statLabel}>Sub-Drainage</span>
            <span className={styles.statSub}>Play even in Monsoons</span>
          </motion.div>

          <motion.div variants={cardFadeUp} className={styles.statCard}>
            <span className={styles.statNumber}>2 Sports</span>
            <span className={styles.statLabel}>Football &amp; Cricket</span>
            <span className={styles.statSub}>Equipped with Gear</span>
          </motion.div>
        </div>
      </motion.section>

      {/* ── LIVE TODAY'S SLOTS PREVIEW ── */}
      <section id="slots-preview" className={`${styles.section} ${styles.slotsSection}`}>
        <div className={styles.sectionInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={scrollRevealSection}
            className={styles.sectionHeader}
          >
            <span className={styles.sectionTag}>Live Court Availability</span>
            <h2 className={styles.sectionHeading}>Today&apos;s Slot Timeline</h2>
            <p className={styles.sectionDesc}>
              Check slot status in real-time. Click any available time to start instant reservation.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={scrollRevealSection}
            className={styles.slotsContainer}
          >
            <div className={styles.slotsHeader}>
              <div className={styles.slotsHeaderTitle}>
                Live Court Availability (Today)
              </div>
              <div className={styles.slotsLegend}>
                <div className={styles.legendAvailable}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E676' }} />
                  <span>Available</span>
                </div>
                <div className={styles.legendPeak}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFB800' }} />
                  <span>Peak Hours (Floodlights)</span>
                </div>
              </div>
            </div>

            <div className={styles.slotsTimelineGrid}>
              {timeSlots.map((slot) => {
                const isPast = slot.hour < currentHour;
                const isBooked = bookedSlotsToday.includes(slot.hour);
                const isPeak = slot.hour >= pricing.peakStart;
                const price = isPeak ? pricing.peak : pricing.offPeak;

                return (
                  <Link
                    key={slot.hour}
                    href={isPast || isBooked ? '#' : `/book?slot=${slot.hour}`}
                    className={styles.slotPill}
                    style={{
                      opacity: isPast || isBooked ? 0.35 : 1,
                      pointerEvents: isPast || isBooked ? 'none' : 'auto',
                      borderColor: isPeak ? 'rgba(255, 184, 0, 0.35)' : 'rgba(0, 230, 118, 0.3)',
                    }}
                  >
                    <span className={styles.slotPillTime}>{slot.label}</span>
                    <span className={styles.slotPillPrice}>₹{price}/hr</span>
                    <span className={styles.slotPillPeakBadge}>
                      {isBooked ? 'Booked' : isPast ? 'Past' : isPeak ? 'Peak LED' : 'Daylight'}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href="/book" className="btn-primary">
                <Calendar size={18} />
                <span>View Full Calendar &amp; Reserve</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SPECS & STADIUM AMENITIES ── */}
      <section id="specs" className={`${styles.section} ${styles.specsSection}`}>
        <div className={styles.sectionInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={scrollRevealSection}
            className={styles.sectionHeader}
          >
            <span className={styles.sectionTag}>World-Class Amenities</span>
            <h2 className={styles.sectionHeading}>Engineered for Peak Performance</h2>
            <p className={styles.sectionDesc}>
              Every detail at East Welfare Turf is designed to deliver a premier sporting experience for casual players and competitive teams alike.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={cardStagger}
            className={styles.specsGrid}
          >
            <motion.div variants={cardFadeUp} className={styles.specCard}>
              <div className={styles.specIconBox}>
                <Sun size={28} />
              </div>
              <h3 className={styles.specCardTitle}>4K Stadium Floodlighting</h3>
              <p className={styles.specCardDesc}>
                High-lux LED array delivering over 800+ Lux with zero shadows or glare. Perfectly calibrated for evening &amp; night matches with broadcast clarity.
              </p>
            </motion.div>

            <motion.div variants={cardFadeUp} className={styles.specCard}>
              <div className={styles.specIconBox}>
                <ShieldCheck size={28} />
              </div>
              <h3 className={styles.specCardTitle}>Heavy-Duty Rebound Netting</h3>
              <p className={styles.specCardDesc}>
                12-foot high-tension boundary netting encasing the entire arena. Keeps the ball in play continuously for fast, uninterrupted box cricket and football.
              </p>
            </motion.div>

            <motion.div variants={cardFadeUp} className={styles.specCard}>
              <div className={styles.specIconBox}>
                <Users size={28} />
              </div>
              <h3 className={styles.specCardTitle}>Covered Dugouts &amp; Gallery</h3>
              <p className={styles.specCardDesc}>
                Ergonomic spectator gallery and team dugout benches sheltered from rain and heat. Ample space for subs, coaches, and cheering fans.
              </p>
            </motion.div>

            <motion.div variants={cardFadeUp} className={styles.specCard}>
              <div className={styles.specIconBox}>
                <Activity size={28} />
              </div>
              <h3 className={styles.specCardTitle}>Rapid Sub-Surface Drainage</h3>
              <p className={styles.specCardDesc}>
                Advanced porous stone sub-base engineered to drain heavy monsoons within minutes. Never worry about waterlogged pitches ruining match day.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── TRANSPARENT PRICING ── */}
      <section id="pricing" className={`${styles.section} ${styles.pricingSection}`}>
        <div className={styles.sectionInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={scrollRevealSection}
            className={styles.sectionHeader}
          >
            <span className={styles.sectionTag}>Transparent Rates</span>
            <h2 className={styles.sectionHeading}>Simple, Honest Pricing</h2>
            <p className={styles.sectionDesc}>
              No hidden fees. Book instantly online and pay flexibly at the venue via UPI or cash.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={cardStagger}
            className={styles.pricingGrid}
          >
            {/* Off-Peak Card */}
            <motion.div variants={cardFadeUp} className={styles.pricingCard}>
              <div className={styles.pricingTag}>Daylight Hours</div>
              <div className={styles.pricingHours}>
                6:00 AM – {pricing.peakStart >= 12 ? (pricing.peakStart === 12 ? '12:00 PM' : `${pricing.peakStart - 12}:00 PM`) : `${pricing.peakStart}:00 AM`}
              </div>
              <div className={styles.pricingPriceRow}>
                <span className={styles.priceSymbol}>₹</span>
                <span className={styles.priceAmount}>{pricing.offPeak}</span>
                <span className={styles.pricePer}>/ hour</span>
              </div>

              <ul className={styles.pricingFeaturesList}>
                <li className={styles.pricingFeatureItem}>
                  <CheckCircle size={18} color="#00E676" />
                  <span>Full access to Football &amp; Cricket turf</span>
                </li>
                <li className={styles.pricingFeatureItem}>
                  <CheckCircle size={18} color="#00E676" />
                  <span>Match footballs &amp; cricket gear included</span>
                </li>
                <li className={styles.pricingFeatureItem}>
                  <CheckCircle size={18} color="#00E676" />
                  <span>Changing room &amp; hydration facility</span>
                </li>
                <li className={styles.pricingFeatureItem}>
                  <CheckCircle size={18} color="#00E676" />
                  <span>Ideal for team training &amp; casual games</span>
                </li>
              </ul>

              <Link href="/book" className="btn-secondary" style={{ width: '100%' }}>
                Book Daylight Slot
              </Link>
            </motion.div>

            {/* Prime Peak Card */}
            <motion.div variants={cardFadeUp} className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
              <div className={styles.featuredBadge}>Prime Floodlight</div>
              <div className={styles.pricingTag}>Prime Floodlight Hours</div>
              <div className={styles.pricingHours}>
                {pricing.peakStart >= 12 ? (pricing.peakStart === 12 ? '12:00 PM' : `${pricing.peakStart - 12}:00 PM`) : `${pricing.peakStart}:00 AM`} – 12:00 AM Midnight
              </div>
              <div className={styles.pricingPriceRow}>
                <span className={styles.priceSymbol}>₹</span>
                <span className={styles.priceAmount}>{pricing.peak}</span>
                <span className={styles.pricePer}>/ hour</span>
              </div>

              <ul className={styles.pricingFeaturesList}>
                <li className={styles.pricingFeatureItem}>
                  <CheckCircle size={18} color="#00E676" />
                  <span>Full 4K Stadium LED Floodlight Array</span>
                </li>
                <li className={styles.pricingFeatureItem}>
                  <CheckCircle size={18} color="#00E676" />
                  <span>High-octane tournament atmosphere</span>
                </li>
                <li className={styles.pricingFeatureItem}>
                  <CheckCircle size={18} color="#00E676" />
                  <span>Match balls, bibs &amp; scoreboard support</span>
                </li>
                <li className={styles.pricingFeatureItem}>
                  <CheckCircle size={18} color="#00E676" />
                  <span>Instant WhatsApp booking confirmation</span>
                </li>
              </ul>

              <Link href="/book" className="btn-primary" style={{ width: '100%' }}>
                Book Floodlight Slot
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── COMMUNITY REVIEWS ── */}
      <section id="reviews" className={`${styles.section} ${styles.reviewsSection}`}>
        <div className={styles.sectionInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={scrollRevealSection}
            className={styles.sectionHeader}
          >
            <span className={styles.sectionTag}>Player Testimonials</span>
            <h2 className={styles.sectionHeading}>Loved by Central Travancore Teams</h2>
            <p className={styles.sectionDesc}>
              Hear what footballers, cricket captains, and tournament organizers say about East Welfare Turf.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={cardStagger}
            className={styles.reviewsGrid}
          >
            <motion.div variants={cardFadeUp} className={styles.reviewCard}>
              <div>
                <div className={styles.reviewStars}>★★★★★</div>
                <p className={styles.reviewQuote}>
                  &ldquo;Easily the best turf around Mannar &amp; Mavelikkara. The lighting at 9 PM feels like an international stadium, and the grass quality protects your knees completely.&rdquo;
                </p>
              </div>
              <div className={styles.reviewAuthor}>
                <div className={styles.authorAvatar}>FC</div>
                <div>
                  <strong style={{ color: '#FFFFFF', display: 'block', fontSize: '0.95rem' }}>Fahad C.</strong>
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Captain, Mannar United FC</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={cardFadeUp} className={styles.reviewCard}>
              <div>
                <div className={styles.reviewStars}>★★★★★</div>
                <p className={styles.reviewQuote}>
                  &ldquo;Booking is super smooth on mobile. You get instant WhatsApp confirmation and don&apos;t have to call back and forth. The box cricket rebound action is phenomenal!&rdquo;
                </p>
              </div>
              <div className={styles.reviewAuthor}>
                <div className={styles.authorAvatar}>AK</div>
                <div>
                  <strong style={{ color: '#FFFFFF', display: 'block', fontSize: '0.95rem' }}>Arjun Krishnan</strong>
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Red Bull Strikers Box Cricket</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={cardFadeUp} className={styles.reviewCard}>
              <div>
                <div className={styles.reviewStars}>★★★★★</div>
                <p className={styles.reviewQuote}>
                  &ldquo;We played during heavy rains last week and there was zero waterlogging. Sub-drainage is 10/10. Great parking space and friendly staff.&rdquo;
                </p>
              </div>
              <div className={styles.reviewAuthor}>
                <div className={styles.authorAvatar}>RJ</div>
                <div>
                  <strong style={{ color: '#FFFFFF', display: 'block', fontSize: '0.95rem' }}>Rahul Joseph</strong>
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Corporate League Organizer</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section id="faq" className={styles.section}>
        <div className={styles.sectionInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={scrollRevealSection}
            className={styles.sectionHeader}
          >
            <span className={styles.sectionTag}>Got Questions?</span>
            <h2 className={styles.sectionHeading}>Frequently Asked Questions</h2>
            <p className={styles.sectionDesc}>
              Everything you need to know before booking your match.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={cardStagger}
            className={styles.faqList}
          >
            {[
              {
                q: 'What shoes / footwear should we wear?',
                a: 'Rubber studs, turf trainers, or flat sole sports shoes are recommended. Metal spikes or sharp metal studs are strictly prohibited to preserve the artificial turf.',
              },
              {
                q: 'How does payment work?',
                a: 'You can reserve your slot online without upfront payment and settle the amount at the venue via UPI (GPay / PhonePe / Paytm) or Cash before kickoff.',
              },
              {
                q: 'What is the cancellation policy?',
                a: 'You can easily cancel your booking from your dashboard up to 2 hours before the scheduled slot time with zero penalties.',
              },
              {
                q: 'Are footballs, cricket bats, and bibs provided?',
                a: 'Yes! High-grade match footballs, box cricket tennis balls, cricket bats, wickets, and team bibs are available free of charge at the reception.',
              },
              {
                q: 'What happens if it rains heavily?',
                a: 'Our turf is engineered with high-capacity sub-surface gravel drainage. Water clears in minutes, allowing continuous safe play in rainy conditions.',
              },
            ].map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <motion.div
                  key={idx}
                  variants={cardFadeUp}
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className={styles.faqQuestion}
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp size={20} color="#00E676" /> : <ChevronDown size={20} color="#94A3B8" />}
                  </button>
                  {isOpen && (
                    <div className={styles.faqAnswer}>
                      {item.a}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── LOCATION & DIRECTIONS ── */}
      <section id="location" className={`${styles.section} ${styles.locationSection}`}>
        <div className={styles.sectionInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={scrollRevealSection}
            className={styles.locationGrid}
          >
            <div className={styles.locationDetails}>
              <span className={styles.sectionTag}>Find Our Turf</span>
              <h3>Easy to Reach in Mannar</h3>
              <p>
                Located conveniently in Mannar, Central Travancore with wide road access and dedicated private parking for both cars and two-wheelers.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF' }}>
                  <MapPin size={20} color="#00E676" />
                  <span>East Welfare Turf, Mannar, Alappuzha, Kerala</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF' }}>
                  <Clock size={20} color="#00E676" />
                  <span>Open Daily: 6:00 AM – 12:00 AM Midnight</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF' }}>
                  <Phone size={20} color="#00E676" />
                  <span>Support: +91 97782 17878</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href="https://maps.google.com/?q=East+Welfare+Turf+Mannar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <Compass size={18} />
                  <span>Open Google Maps</span>
                </a>
                <a
                  href="https://wa.me/919778217878?text=Hello%20East%20Welfare%20Turf,%20I%20would%20like%20directions%20to%20the%20venue"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <Phone size={18} color="#00E676" />
                  <span>WhatsApp Location</span>
                </a>
              </div>
            </div>

            {/* Styled Map Box */}
            <div
              style={{
                position: 'relative',
                height: '340px',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15743.722648782333!2d76.52345!3d9.31234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMTgnNDQuNCJOIDc2wrAzMSczNi40IkU!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                allowFullScreen={false}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WORLD-CLASS SPORTS FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3>EAST WELFARE <span style={{ color: '#00E676' }}>TURF</span></h3>
            <p>
              Central Travancore&apos;s premier multi-sport turf facility. Built for passion, speed, and unforgettable match nights in Mannar.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h4>Quick Navigation</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#slots-preview">Live Availability</a></li>
              <li><a href="#specs">Stadium Specs &amp; Lighting</a></li>
              <li><a href="#pricing">Rates &amp; Peak Hours</a></li>
              <li><Link href="/book">Book Pitch Online</Link></li>
              {session && <li><Link href="/dashboard">Player Dashboard</Link></li>}
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Legal &amp; Policy</h4>
            <ul className={styles.footerLinks}>
              <li><button onClick={() => openTermsModal()}>Terms of Booking</button></li>
              <li><button onClick={() => openPrivacyModal()}>Privacy Policy</button></li>
              <li><a href="#faq">Rules &amp; Footwear Guide</a></li>
              <li><Link href="/admin-login">Admin Access</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div>
            © {new Date().getFullYear()} East Welfare Turf, Mannar. All rights reserved.
          </div>
          <div>
            Engineered with High-Performance Sports Tech
          </div>
        </div>
      </footer>

      {/* Welcome / Sign-In Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </main>
  );
}
