"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Calendar, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;
  if (pathname?.startsWith("/book")) return null;
  if (pathname === "/dashboard") return null;
  if (!session) return null;

  const isAdmin = (session.user as { role?: string })?.role === "ADMIN";

  return (
    <div className={styles.navbarContainer} ref={menuRef}>
      <button 
        className={styles.profileBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile Menu"
      >
        <User size={20} color="#00E676" />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownHeader}>
            <strong>{session.user?.name || "Verified Player"}</strong>
            <span>{session.user?.email}</span>
          </div>
          
          <div className={styles.dropdownLinks}>
            <Link href="/dashboard" className={styles.dropdownItem}>
              <LayoutDashboard size={16} />
              {isAdmin ? "Admin Panel" : "My Bookings"}
            </Link>
            
            <Link href="/book" className={styles.dropdownItem}>
              <Calendar size={16} />
              Book Another Slot
            </Link>
            
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`${styles.dropdownItem} ${styles.signOutBtn}`}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
