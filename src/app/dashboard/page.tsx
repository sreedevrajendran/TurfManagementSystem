import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import styles from "./page.module.css";
import { AlertCircle, CheckCircle } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  // Find bookings for the logged-in user
  const userBookings = await prisma.booking.findMany({
    where: { userId: (session.user as any).id },
    include: { team: true },
    orderBy: { date: "desc" }
  });

  const pendingDues = userBookings.filter((b: typeof userBookings[0]) => b.status === "DUE");
  const pastBookings = userBookings.filter((b: typeof userBookings[0]) => b.status === "PAID" || b.status === "CANCELLED");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome, {session.user.name}</h1>
          <p className={styles.subtitle}>Manage your bookings and view your due status here.</p>
        </div>
        <LogoutButton />
      </header>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <AlertCircle color="#FF4444" size={24} /> Pending Dues
          </h2>
          {pendingDues.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle color="#00E676" size={48} />
              <p>You have no pending dues! You are ready to book.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {pendingDues.map(due => (
                <li key={due.id} className={styles.dueItem}>
                  <div>
                    <strong>{due.date.toDateString()}</strong>
                    <p>Team: {due.team?.name}</p>
                  </div>
                  <span className={styles.dueAmount}>₹{due.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Past Bookings & Cleared Dues</h2>
          {pastBookings.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No past bookings found.</p>
          ) : (
            <ul className={styles.list}>
              {pastBookings.map(booking => (
                <li key={booking.id} className={styles.historyItem}>
                  <div>
                    <strong>{booking.date.toDateString()}</strong>
                    <p>Slot: {booking.startTime}:00</p>
                  </div>
                  <span className={booking.status === "PAID" ? styles.paidStatus : styles.cancelledStatus}>
                    {booking.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
