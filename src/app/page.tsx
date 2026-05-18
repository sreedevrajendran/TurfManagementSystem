'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Trophy, CalendarCheck, LogIn, User } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import styles from './page.module.css';

export default function Home() {
  const { data: session } = useSession();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80, damping: 20 } }
  };

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <Image
          src="/hero.png"
          alt="East Welfare Turf"
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
              <MapPin size={16} className={styles.badgeIcon} /> Mannar East Welfare School
            </span>
          </motion.div>
          <motion.h1 variants={itemVariants} className={styles.title}>EAST WELFARE TURF</motion.h1>
          <motion.p variants={itemVariants} className={styles.subtitle}>
            Experience premium 6-a-side artificial grass football under the lights. Fast bookings, dynamic pricing, and seamless team management.
          </motion.p>
          <motion.div variants={itemVariants} className={styles.ctaWrapper}>
            <Link href="/book" className={styles.ctaButton}>
               Book Your Turf Now
            </Link>
            
            {session ? (
              <Link href="/dues" className={styles.ghostButton}>
                 <User size={20} style={{ marginRight: 8 }} /> My Dashboard
              </Link>
            ) : (
              <button onClick={() => signIn("google")} className={styles.googleButton}>
                 <LogIn size={20} style={{ marginRight: 8 }} /> Sign In with Google
              </button>
            )}
          </motion.div>
        </motion.div>
      </section>

      <section className={styles.infoSection}>
        <div className={styles.infoContent}>
          <h2>Why Choose Us?</h2>
          <p>
            East Welfare Turf is more than just a playing field; it's a community hub for football enthusiasts. 
            Located in the heart of Mannar, our facility boasts top-of-the-line FIFA-quality artificial grass, 
            powerful LED floodlights for night games, and a spectator-friendly environment.
          </p>
        </div>
      </section>

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
              <h3>Premium Quality</h3>
              <p>Top-tier 6's artificial turf designed for high-performance matches, excellent ball control, and injury prevention.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconBox}><CalendarCheck size={32} /></div>
              <h3>Easy Bookings</h3>
              <p>Book instantly. Clear visibility of peak & off-peak hours with automated dynamic pricing calculations.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconBox}><MapPin size={32} /></div>
              <h3>Prime Location</h3>
              <p>Located right at Mannar East Welfare School with ample parking, amenities, and easy accessibility.</p>
            </div>
         </motion.div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3>EAST WELFARE TURF</h3>
            <p>Mannar East Welfare School, Kerala</p>
          </div>
          <div className={styles.footerContact}>
            <h4>Contact Us</h4>
            <p>Phone: +91 98765 43210</p>
            <p>Email: bookings@eastwelfare.com</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} East Welfare Turf. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}
