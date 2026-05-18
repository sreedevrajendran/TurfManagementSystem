"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(255,68,68,0.1)",
        color: "#ff6b6b",
        padding: "10px 20px",
        borderRadius: "99px",
        fontWeight: "700",
        fontSize: "14px",
        border: "1px solid rgba(255,68,68,0.3)",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,68,68,0.22)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,68,68,0.6)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,68,68,0.1)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,68,68,0.3)";
      }}
    >
      <LogOut size={16} />
      Sign Out
    </button>
  );
}
