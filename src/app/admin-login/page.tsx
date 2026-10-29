"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./page.module.css";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      router.push("/admin");
    }
  }, [status, isAdmin, router]);

  const handleAdminGoogleLogin = () => {
    signIn("google", { callbackUrl: "/admin" });
  };

  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.loginCard}
      >
        <div className={styles.header}>
          {isAdmin ? (
            <ShieldCheck size={48} color="var(--primary-accent)" />
          ) : (
            <ShieldAlert size={48} color="var(--primary-accent)" />
          )}
          <h1>Admin Portal</h1>
          <p>Restricted access for EAST WELFARE TURF administrators.</p>
        </div>

        {status === "loading" ? (
          <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>Verifying session...</p>
        ) : session?.user ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Signed in as <strong>{session.user.email}</strong>
            </p>
            {!isAdmin ? (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "12px",
                padding: "12px",
                color: "#ef4444",
                fontSize: "0.85rem"
              }}>
                This account does not have administrator privileges. Please sign in using the authorized administrator Google account.
              </div>
            ) : (
              <div style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                borderRadius: "12px",
                padding: "12px",
                color: "#22c55e",
                fontSize: "0.85rem"
              }}>
                Admin verified. Redirecting to dashboard...
              </div>
            )}
            <button 
              type="button" 
              onClick={handleAdminGoogleLogin} 
              className={styles.submitBtn}
            >
              {!isAdmin ? "Switch to Admin Google Account" : "Go to Dashboard"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center" }}>
              Administrators must authenticate using their authorized Google Workspace account.
            </p>
            <button 
              type="button" 
              onClick={handleAdminGoogleLogin} 
              className={styles.submitBtn}
            >
              Sign In with Google (Admin)
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
