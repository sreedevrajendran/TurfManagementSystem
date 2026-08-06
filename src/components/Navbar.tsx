"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show on admin pages — admin has its own header
  if (pathname?.startsWith("/admin")) return null;

  // Don't show on the book page — it has its own minimal nav
  if (pathname?.startsWith("/book")) return null;

  if (!session) return null;

  const isAdmin = (session.user as { role?: string })?.role === "ADMIN";

  return (
    <div className={styles.navbar}>
      {/* Dashboard link (only on non-dashboard pages) */}
      {pathname !== "/dashboard" && (
        <Link href="/dashboard" className={styles.navLink}>
          <User size={16} color="#00E676" />
          {isAdmin ? "Admin Panel" : "Dashboard"}
        </Link>
      )}

      {/* Logout button — always visible when signed in */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className={styles.navBtn}
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
