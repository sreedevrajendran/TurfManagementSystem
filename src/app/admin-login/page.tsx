"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./page.module.css";
import { ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      username,
      password,
      callbackUrl: "/admin",
    });
  };

  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.loginCard}
      >
        <div className={styles.header}>
          <ShieldAlert size={48} color="var(--primary-accent)" />
          <h1>Admin Portal</h1>
          <p>Restricted access for EAST WELFARE TURF administrators.</p>
        </div>

        <form onSubmit={handleAdminLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Username</label>
            <input 
              type="text" 
              className={styles.input} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username" 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password" 
            />
          </div>
          <button type="submit" className={styles.submitBtn}>
            Secure Login
          </button>
        </form>
      </motion.div>
    </div>
  );
}
