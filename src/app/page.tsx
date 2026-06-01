'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, LogIn, User, Phone, Mail, Sun, Moon, Clock, Zap, Shield, Users } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import styles from './page.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className={styles.main}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <video autoPlay loop muted playsInline className={styles.heroVideo} poster="/hero.png">
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} />
        <motion.div className={styles.heroContent} initial="hidden" animate="visible" variants={stagger}>
          {session?.user?.name && (
            <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px', display: 'inline-block', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                👋 Welcome back, {session.user.name.split(' ')[0]}!
              </div>
            </motion.div>
          )}
          <motion.div variants={fadeUp} className={styles.badgeWrapper}>
            <span className={styles.badge}>
              <MapPin size={14} className={styles.badgeIcon} /> Mannar East Welfare School, Kerala
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className={styles.title}>EAST WELFARE TURF</motion.h1>
          <motion.p variants={fadeUp} className={styles.subtitle}>
            Premium Football &amp; Cricket on high-quality artificial grass with LED floodlights.
            Fast bookings, dynamic pricing — play day or night.
          </motion.p>
          <motion.div variants={fadeUp} className={styles.ctaWrapper}>
            <Link href="/book" className={styles.ctaButton}>⚽ Book Your Slot Now</Link>
            {session ? (
              <Link href="/dashboard" className={styles.ghostButton}>
                <User size={18} style={{ marginRight: 8 }} /> My Dashboard
              </Link>
            ) : (
              <button onClick={() => signIn('google', { callbackUrl: '/' })} className={styles.googleButton}>
                <LogIn size={18} style={{ marginRight: 8 }} /> Sign In with Google
              </button>
            )}
          </motion.div>
        </motion.div>
        <div className={styles.scrollHint}>
          <div className={styles.scrollLine} />
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ── SPORTS SECTION ── */}
      <section className={styles.sportsSection}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionTag}>OUR SPORTS</span>
          <h2 className={styles.sectionTitle}>Two Sports, One Venue</h2>
          <p className={styles.sectionSubtitle}>World-class facilities for football and cricket enthusiasts alike</p>
        </motion.div>
        <div className={styles.sportsGrid}>
          {[
            {
              emoji: '⚽',
              sport: 'Football',
              color: '#00e676',
              glow: 'rgba(0,230,118,0.15)',
              desc: '6-a-side matches on premium artificial grass. Perfect for quick matches, training sessions, and local league games.',
              features: ['6-a-side format', 'Artificial turf', 'LED flood lighting', 'Year-round play'],
            },
            {
              emoji: '🏏',
              sport: 'Cricket',
              color: '#00b0ff',
              glow: 'rgba(0,176,255,0.15)',
              desc: 'Practice nets and open pitch for cricket. Sharpen your batting, bowling, and fielding skills any time of day.',
              features: ['Practice nets', 'Open pitch area', 'Hard & soft ball', '24/7 bookings'],
            },
          ].map((s, i) => (
            <motion.div
              key={s.sport}
              className={styles.sportCard}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              style={{ '--sport-color': s.color, '--sport-glow': s.glow } as React.CSSProperties}
            >
              <div className={styles.sportCardEmoji}>{s.emoji}</div>
              <h3 className={styles.sportCardTitle}>{s.sport}</h3>
              <p className={styles.sportCardDesc}>{s.desc}</p>
              <ul className={styles.sportFeatures}>
                {s.features.map(f => (
                  <li key={f}><span className={styles.featureDot} style={{ background: s.color }} />  {f}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRICING BANNER ── */}
      <section className={styles.pricingBanner}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionTag}>PRICING</span>
          <h2 className={styles.sectionTitle}>Simple, Fair Pricing</h2>
          <p className={styles.sectionSubtitle}>Same rates for Football &amp; Cricket · Pay at venue</p>
        </motion.div>
        <div className={styles.pricingGrid}>
          <motion.div
            className={`${styles.priceCard} ${styles.offPeak}`}
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <Sun size={36} />
            <div>
              <div className={styles.priceLabel}>Day Slots (Off-Peak)</div>
              <div className={styles.priceTime}>6:00 AM – 7:00 PM</div>
            </div>
            <div className={styles.priceAmount}>₹800<span>/hr</span></div>
          </motion.div>
          <motion.div
            className={`${styles.priceCard} ${styles.peak}`}
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <Moon size={36} />
            <div>
              <div className={styles.priceLabel}>Night Slots (Peak + Lights)</div>
              <div className={styles.priceTime}>7:00 PM – 6:00 AM</div>
            </div>
            <div className={styles.priceAmount}>₹1200<span>/hr</span></div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.featuresSection}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionTag}>WHY CHOOSE US</span>
          <h2 className={styles.sectionTitle}>World-Class Facilities</h2>
        </motion.div>
        <div className={styles.featuresGrid}>
          {[
            { icon: <Zap size={28} />, title: 'Instant Booking', desc: 'Book your slot in under 60 seconds. No calls, no waiting.' },
            { icon: <Clock size={28} />, title: 'Open 24/7', desc: 'Play whenever you want — day or night, any day of the year.' },
            { icon: <Shield size={28} />, title: 'Premium Quality', desc: 'High-grade artificial turf for football. Proper pitch for cricket.' },
            { icon: <Users size={28} />, title: 'Community Hub', desc: 'Bringing local football and cricket fans together since day one.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className={styles.iconBox}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PHOTO SECTIONS ── */}
      {[
        { src: '/school-1.jpg', alt: 'East Welfare Turf Night', heading: 'The Heart of Local Sports', body: "Nestled inside the historic Mannar East Welfare School, our turf isn\u2019t just a ground\u2014it\u2019s a community hub built to foster local athletic talent and bring people together." },
        { src: '/school-2.jpg', alt: 'Night Games', heading: 'Stadium-Grade Night Games', body: 'By day, the grounds echo with the energy of students. By night, it transforms under our powerful LED floodlights into a battleground for local legends.' },
        { src: '/school-3.jpg', alt: 'Premium Turf', heading: 'Premium Artificial Grass', body: 'Play on high-quality artificial turf designed for fast-paced football and sharp cricket matches. Excellent grip, ultimate player safety, perfect for every skill level.' },
        { src: '/school-4.jpg', alt: 'World-Class Atmosphere', heading: 'A World-Class Atmosphere', body: 'Surrounded by the flags of world football giants and cricket legends, playing here feels like stepping onto a premier stadium pitch right in Kerala. Open 24/7!' },
      ].map((sec, i) => (
        <section key={sec.alt} className={styles.snapSection} style={{ flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
          <motion.img
            src={sec.src} alt={sec.alt} className={styles.snapBg}
            initial={{ scale: 1.08, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            viewport={{ amount: 0.2 }}
          />
          <div className={styles.snapOverlay} />
          <motion.div
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ amount: 0.3 }}
            className={styles.snapContent}
          >
            <h2>{sec.heading}</h2>
            <p>{sec.body}</p>
            <Link href="/book" className={styles.snapCta}>Book Now →</Link>
          </motion.div>
        </section>
      ))}

      {/* ── CTA BAND ── */}
      <section className={styles.ctaBand}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.ctaBandInner}
        >
          <h2>Ready to Play?</h2>
          <p>Football or Cricket — pick your sport and book your slot in seconds.</p>
          <div className={styles.ctaWrapper} style={{ justifyContent: 'center', marginTop: 32 }}>
            <Link href="/book" className={styles.ctaButton}>⚽ Book a Slot Now</Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3>⚽🏏 EAST WELFARE TURF</h3>
            <p>Mannar East Welfare School, Mannar, Kerala</p>
            <p style={{ marginTop: 12, fontSize: '0.85rem', opacity: 0.6 }}>
              Football &amp; Cricket · Sign in with Google to book · Pay at the venue.
            </p>
          </div>
          <div className={styles.footerContact}>
            <h4>Contact Us</h4>
            <p><Phone size={14} style={{ display: 'inline', marginRight: 6 }} />
              <a href="tel:+919778518909" style={{ color: 'inherit', textDecoration: 'none' }}>+91 97785 18909</a>
            </p>
            <p><Mail size={14} style={{ display: 'inline', marginRight: 6 }} />
              <a href="mailto:eastwelfareturf@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>eastwelfareturf@gmail.com</a>
            </p>
            <p><MapPin size={14} style={{ display: 'inline', marginRight: 6 }} />Mannar East Welfare School, Kerala</p>
          </div>
          <div className={styles.footerLinks}>
            <h4>Quick Links</h4>
            <Link href="/book" style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 8 }}>📅 Book a Slot</Link>
            <Link href="/dashboard" style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 8 }}>👤 My Dashboard</Link>
            <a href="https://wa.me/919778518909" target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', color: '#25D366', textDecoration: 'none', marginBottom: 8 }}>
              💬 WhatsApp Us
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} East Welfare Turf · Mannar, Kerala · All Rights Reserved</p>
          <p style={{ marginTop: 4, fontSize: '0.78rem', opacity: 0.5 }}>
            Built with ❤️ for the football &amp; cricket community
          </p>
        </div>
      </footer>
    </main>
  );
}
