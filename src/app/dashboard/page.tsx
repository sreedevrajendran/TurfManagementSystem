import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import styles from "./page.module.css";
import { AlertCircle, CheckCircle, Home } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import CancelBookingButton from "@/components/CancelBookingButton";
import PastBookingsList from "@/components/PastBookingsList";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  // Find bookings for the logged-in user
  const userBookings = await prisma.booking.findMany({
    where: { userId: (session.user as any).id },
    include: { team: true },
    orderBy: [
      { date: "desc" },
      { startTime: "desc" }
    ]
  });

  const pendingDues = userBookings.filter((b: typeof userBookings[0]) => b.status === "DUE");
  const pastBookings = userBookings.filter((b: typeof userBookings[0]) => b.status === "PAID" || b.status === "CANCELLED");

  const formatTime = (hour: number) => {
    const h = hour % 24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome, {session.user.name}</h1>
          <p className={styles.subtitle}>Manage your bookings and view your due status here.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/" style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(255,255,255,0.1)', color: '#fff', 
            padding: '8px 16px', borderRadius: '12px', textDecoration: 'none',
            fontWeight: 600
          }}>
            <Home size={18} /> Home
          </Link>
        </div>
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
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                      {formatTime(due.startTime)} – {formatTime((due.startTime + due.durationHours) % 24)}
                    </p>
                    <p>Team: {due.team?.name}</p>
                    {(() => {
                      const bd = new Date(due.date);
                      bd.setHours(due.startTime, 0, 0, 0);
                      const timeDiffMs = bd.getTime() - new Date().getTime();
                      return timeDiffMs >= 30 * 60 * 1000 ? (
                        <CancelBookingButton bookingId={due.id} />
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#FF6B6B', marginTop: '8px', display: 'inline-block' }}>
                          Too late to cancel
                        </span>
                      );
                    })()}
                  </div>
                  <span className={styles.dueAmount}>₹{due.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Past Bookings & Cleared Dues</h2>
          <PastBookingsList bookings={pastBookings.map((b: any) => ({ ...b, date: b.date.toISOString(), createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() }))} />
        </section>
      </div>
    </div>
  );
}
