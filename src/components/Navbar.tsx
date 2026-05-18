"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show on admin pages — admin has its own header
  if (pathname.startsWith("/admin")) return null;

  // Don't show on the book page — it has its own minimal nav
  if (pathname.startsWith("/book")) return null;

  // Don't show on homepage — it has its own CTA buttons
  if (pathname === "/") return null;

  if (!session) return null;

  const isAdmin = (session.user as any)?.role === "ADMIN";

  return (
    <div style={{
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: 50,
      display: "flex",
      gap: "10px",
      alignItems: "center",
    }}>
      {/* Dashboard link (only on non-dashboard pages) */}
      {pathname !== "/dashboard" && (
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-surface)",
            color: "#fff",
            padding: "9px 18px",
            borderRadius: "99px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "14px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            backdropFilter: "blur(10px)",
          }}
        >
          <User size={16} color="var(--primary-accent)" />
          {isAdmin ? "Admin Panel" : "Dashboard"}
        </Link>
      )}

      {/* Logout button — always visible when signed in */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,68,68,0.1)",
          color: "#ff6b6b",
          padding: "9px 18px",
          borderRadius: "99px",
          fontWeight: "bold",
          fontSize: "14px",
          border: "1px solid rgba(255,68,68,0.3)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          backdropFilter: "blur(10px)",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
