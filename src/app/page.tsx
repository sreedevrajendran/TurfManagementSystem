'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Trophy, CalendarCheck, LogIn, User, Phone, Mail, Clock, Sun, Moon, Zap } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import styles from './page.module.css';

export default function Home() {
  const { data: session } = useSession();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80, damping: 20 } }
  };

  return (
    <main className={styles.main}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <Image
          src="/hero.png"
          alt="East Welfare Turf - Premium Football Ground Mannar"
          fill
          priority
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <motion.div
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className={styles.badgeWrapper}>
            <span className={styles.badge}>
              <MapPin size={16} className={styles.badgeIcon} /> Mannar East Welfare School, Kerala
            </span>
          </motion.div>
          <motion.h1 variants={itemVariants} className={styles.title}>EAST WELFARE TURF</motion.h1>
          <motion.p variants={itemVariants} className={styles.subtitle}>
            Premium 6-a-side football on high-quality artificial grass with LED floodlights.
            Fast bookings, dynamic pricing — play day or night.
          </motion.p>
          <motion.div variants={itemVariants} className={styles.ctaWrapper}>
            <Link href="/book" className={styles.ctaButton}>
              ⚽ Book Your Slot Now
            </Link>
            {session ? (
              <Link href="/dashboard" className={styles.ghostButton}>
                <User size={20} style={{ marginRight: 8 }} /> My Dashboard
              </Link>
            ) : (
              <button onClick={() => signIn("google", { callbackUrl: "/" })} className={styles.googleButton}>
                <LogIn size={20} style={{ marginRight: 8 }} /> Sign In with Google
              </button>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ── PRICING BANNER ── */}
      <section className={styles.pricingBanner}>
        <div className={styles.pricingGrid}>
          <motion.div
            className={`${styles.priceCard} ${styles.offPeak}`}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Sun size={36} />
            <div>
              <div className={styles.priceLabel}>Day Slots (Off-Peak)</div>
              <div className={styles.priceTime}>6:00 AM – 6:00 PM</div>
            </div>
            <div className={styles.priceAmount}>₹400<span>/hr</span></div>
          </motion.div>
          <motion.div
            className={`${styles.priceCard} ${styles.peak}`}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Moon size={36} />
            <div>
              <div className={styles.priceLabel}>Night Slots (Peak + Lights)</div>
              <div className={styles.priceTime}>6:00 PM – 6:00 AM</div>
            </div>
            <div className={styles.priceAmount}>₹800<span>/hr</span></div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className={styles.infoSection}>
        <div className={styles.infoContent}>
          <h2>Why East Welfare Turf?</h2>
          <p>
            Located at <strong>Mannar East Welfare School</strong>, our facility is the go-to football destination
            for teams in the region. Play on high-quality artificial grass under powerful LED floodlights —
            day or night. Book online in seconds, pay at the venue, and get instant confirmation on your email.
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.featuresSection}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
          className={styles.featuresGrid}
        >
          <div className={styles.featureCard}>
            <div className={styles.iconBox}><Trophy size={32} /></div>
            <h3>Premium Surface</h3>
            <p>High-quality 6-a-side artificial turf designed for fast-paced matches, excellent grip, and player safety.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconBox}><CalendarCheck size={32} /></div>
            <h3>Instant Booking</h3>
            <p>Sign in with Google, pick your slot, and get a confirmation email instantly. No calls needed.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconBox}><Zap size={32} /></div>
            <h3>Night Games</h3>
            <p>Powerful LED floodlights for bright, energy-efficient night games at ₹800/hr including lighting.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconBox}><MapPin size={32} /></div>
            <h3>Prime Location</h3>
            <p>Situated at Mannar East Welfare School with easy road access and parking available on-site.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconBox}><Clock size={32} /></div>
            <h3>Open 24/7</h3>
            <p>Book any hour of the day. Slots available from 6 AM all the way through to 5 AM next morning.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconBox}><Phone size={32} /></div>
            <h3>Easy Contact</h3>
            <p>Reach us directly at +91 97785 18909 or email eastwelfareturf@gmail.com for queries.</p>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3>⚽ EAST WELFARE TURF</h3>
            <p>Mannar East Welfare School, Mannar, Kerala</p>
            <p style={{ marginTop: 12, fontSize: '0.85rem', opacity: 0.6 }}>
              Sign in with Google to book online. Pay at the venue.
            </p>
          </div>

          <div className={styles.footerContact}>
            <h4>Contact Us</h4>
            <p>
              <Phone size={14} style={{ display: 'inline', marginRight: 6 }} />
              <a href="tel:+919778518909" style={{ color: 'inherit', textDecoration: 'none' }}>
                +91 97785 18909
              </a>
            </p>
            <p>
              <Mail size={14} style={{ display: 'inline', marginRight: 6 }} />
              <a href="mailto:eastwelfareturf@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                eastwelfareturf@gmail.com
              </a>
            </p>
            <p>
              <MapPin size={14} style={{ display: 'inline', marginRight: 6 }} />
              Mannar East Welfare School, Kerala
            </p>
          </div>

          <div className={styles.footerLinks}>
            <h4>Quick Links</h4>
            <Link href="/book" style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 8 }}>
              📅 Book a Slot
            </Link>
            <Link href="/dashboard" style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 8 }}>
              👤 My Dashboard
            </Link>
            <a href="https://wa.me/919778518909" target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', color: '#25D366', textDecoration: 'none', marginBottom: 8 }}>
              💬 WhatsApp Us
            </a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} East Welfare Turf · Mannar, Kerala · All Rights Reserved</p>
          <p style={{ marginTop: 4, fontSize: '0.78rem', opacity: 0.5 }}>
            Built with ❤️ for the football community
          </p>
        </div>
      </footer>
    </main>
  );
}
