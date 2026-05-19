'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trophy, CalendarCheck, LogIn, User, Phone, Mail, Clock, Sun, Moon, Zap, Tag } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
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

  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/offers').then(r => r.json()).then(setActiveOffers).catch(() => {});
    fetch('/api/blocks').then(r => r.json()).then(setBlocks).catch(() => {});
  }, []);

  return (
    <main className={styles.main}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className={styles.heroVideo}
          poster="/hero.png"
        >
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>
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
            Premium 6-a-side Football & Cricket on high-quality artificial grass with LED floodlights.
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

      {/* ── SNAP SECTION 1 ── */}
      <section className={styles.snapSection}>
        <motion.img 
          src="/school-1.jpg" 
          alt="East Welfare Turf Night" 
          className={styles.snapBg}
          initial={{ scale: 1.15, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          viewport={{ amount: 0.3 }}
        />
        <div className={styles.snapOverlay}></div>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ amount: 0.4 }}
          className={styles.snapContent}
        >
          <h2>The Heart of Local Sports</h2>
          <p>
            Nestled inside the historic Mannar East Welfare School, our turf isn't just a football and cricket ground—it's a vibrant community hub built to foster local athletic talent and bring people together.
          </p>
        </motion.div>
      </section>

      {/* ── SNAP SECTION 2 ── */}
      <section className={styles.snapSection}>
        <motion.img 
          src="/school-2.jpg" 
          alt="Night Games" 
          className={styles.snapBg}
          initial={{ scale: 1.15, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          viewport={{ amount: 0.3 }}
        />
        <div className={styles.snapOverlay}></div>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ amount: 0.4 }}
          className={styles.snapContent}
        >
          <h2>Stadium-Grade Night Games</h2>
          <p>
            By day, the grounds echo with the energy of students. By night, it transforms under our powerful LED floodlights into a battleground for local legends.
          </p>
        </motion.div>
      </section>

      {/* ── SNAP SECTION 3 ── */}
      <section className={styles.snapSection}>
        <motion.img 
          src="/school-3.jpg" 
          alt="Premium Turf" 
          className={styles.snapBg}
          initial={{ scale: 1.15, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          viewport={{ amount: 0.3 }}
        />
        <div className={styles.snapOverlay}></div>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ amount: 0.4 }}
          className={styles.snapContent}
        >
          <h2>Premium Artificial Grass</h2>
          <p>
            Play on high-quality 6-a-side artificial turf designed for fast-paced matches, excellent grip, and ultimate player safety. The perfect pitch for every skill level.
          </p>
        </motion.div>
      </section>

      {/* ── SNAP SECTION 4 ── */}
      <section className={styles.snapSection}>
        <motion.img 
          src="/school-4.jpg" 
          alt="World Cup Atmosphere" 
          className={styles.snapBg}
          initial={{ scale: 1.15, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          viewport={{ amount: 0.3 }}
        />
        <div className={styles.snapOverlay}></div>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ amount: 0.4 }}
          className={styles.snapContent}
        >
          <h2>A World-Class Atmosphere</h2>
          <p>
            Surrounded by the flags of world football giants and cricket legends, playing here feels like stepping onto a premier stadium pitch right in Kerala. Open 24/7—book any hour of the day or night!
          </p>
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
            Built with ❤️ for the football & cricket community
          </p>
        </div>
      </footer>
    </main>
  );
}
