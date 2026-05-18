"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show floating nav on the dashboard itself or admin pages to avoid clutter
  if (pathname === "/dashboard" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 50 }}>
      {session ? (
        <Link 
          href="/dashboard" 
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-surface)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "99px",
            textDecoration: "none",
            fontWeight: "bold",
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)"
          }}
        >
          <User size={18} color="var(--primary-accent)" /> Dashboard
        </Link>
      ) : null}
    </div>
  );
}
