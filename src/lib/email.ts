import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Templates ──────────────────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `
  <div style="font-family: 'Arial', sans-serif; background: #0a0a0f; color: #e0e0e0; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #00e676 0%, #00b0ff 100%); padding: 32px; text-align: center;">
      <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: 900; letter-spacing: 2px;">⚽ EAST WELFARE TURF</h1>
      <p style="margin: 4px 0 0; color: #000; opacity: 0.8; font-size: 13px;">Mannar East Welfare School, Kerala</p>
    </div>
    <div style="padding: 32px;">
      ${content}
    </div>
    <div style="padding: 20px 32px; background: #111118; text-align: center; font-size: 12px; color: #666;">
      © ${new Date().getFullYear()} East Welfare Turf · All Rights Reserved<br/>
      <a href="https://eastwelfareturf.vercel.app" style="color: #00e676; text-decoration: none;">eastwelfareturf.vercel.app</a>
    </div>
  </div>`;
}

// ── Email Senders ──────────────────────────────────────────────────────────

export async function sendBookingConfirmation({
  to,
  name,
  teamName,
  date,
  startTime,
  duration,
  amount,
  originalAmount,
  offer,
  sport,
}: {
  to: string;
  name: string;
  teamName: string;
  date: string;
  startTime: number;
  duration: number;
  amount: number;
  originalAmount?: number;
  offer?: { title: string; discountPct: number; slotType: string } | null;
  sport?: string;
}) {
  const formatHour = (hour: number) => {
    const h = hour % 24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  };

  const offerBadge = offer ? `
    <div style="background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.15)); border: 1px solid rgba(255,215,0,0.5); border-radius: 12px; padding: 14px 18px; margin: 16px 0; text-align: center;">
      <div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">🎉 Special Offer Applied</div>
      <div style="font-size: 20px; font-weight: 900; color: #FFD700;">${offer.discountPct}% OFF — ${offer.title}</div>
      <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px;">
        ${offer.slotType === 'PEAK' ? 'Evening/Night slots' : offer.slotType === 'OFF_PEAK' ? 'Day slots' : 'All slots'}
      </div>
    </div>
  ` : '';

  const savings = originalAmount && originalAmount > amount ? originalAmount - amount : 0;
  const amountHtml = savings > 0
    ? `<span style="color: rgba(255,255,255,0.4); text-decoration: line-through; font-size: 14px; margin-right: 8px;">₹${originalAmount}</span><span style="color: #FFD700; font-size: 20px; font-weight: 900;">₹${amount}</span> <span style="color: #00e676; font-size: 13px;">(You saved ₹${savings}!)</span>`
    : `<span style="color: #00e676; font-size: 18px;">₹${amount}</span>`;

  const subject = "✅ Booking Confirmed – East Welfare Turf";
  const html = baseTemplate(`
    <h2 style="color: #00e676; font-size: 22px;">Booking Confirmed!</h2>
    <p>Hi <strong>${name}</strong>, your slot has been successfully booked.</p>
    ${offerBadge}
    <div style="background: #141420; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #00e676;">
      <p style="margin: 0 0 8px;"><strong>Team:</strong> ${teamName}</p>
      <p style="margin: 0 0 8px;"><strong>Date:</strong> ${date}</p>
      <p style="margin: 0 0 8px;"><strong>Time:</strong> ${formatHour(startTime)} – ${formatHour((startTime + duration) % 24)}</p>
      <p style="margin: 0 0 8px;"><strong>Duration:</strong> ${duration} hour(s)</p>
      <p style="margin: 0;"><strong>Amount Due at Venue:</strong> ${amountHtml}</p>
    </div>
    <p style="color: #aaa;">Please arrive 10 minutes early. Payment is collected at the venue. See you on the pitch! ${sport === 'CRICKET' ? '🏏' : '⚽'}</p>
  `);

  await transporter.sendMail({ from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`, to, subject, html });
}


export async function sendPaymentThankYou({
  to,
  name,
  teamName,
  amount,
  date,
}: {
  to: string;
  name: string;
  teamName: string;
  amount: number;
  date: string;
}) {
  const subject = "🙏 Payment Received – Thank You!";
  const html = baseTemplate(`
    <h2 style="color: #00e676; font-size: 22px;">Payment Confirmed!</h2>
    <p>Hi <strong>${name}</strong>, we have received your payment. Thank you!</p>
    <div style="background: #141420; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #00e676;">
      <p style="margin: 0 0 8px;"><strong>Team:</strong> ${teamName}</p>
      <p style="margin: 0 0 8px;"><strong>Date:</strong> ${date}</p>
      <p style="margin: 0;"><strong>Amount Paid:</strong> <span style="color: #00e676; font-size: 18px;">₹${amount}</span></p>
    </div>
    <p style="color: #aaa;">Your account is now clear. We look forward to seeing you again on the turf! 🏆</p>
  `);

  await transporter.sendMail({ from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`, to, subject, html });
}

export async function sendDueAlert({
  to,
  name,
  teamName,
  amount,
  date,
}: {
  to: string;
  name: string;
  teamName: string;
  amount: number;
  date: string;
}) {
  const subject = "⚠️ Payment Reminder – East Welfare Turf";
  const html = baseTemplate(`
    <h2 style="color: #FF6B35; font-size: 22px;">Payment Reminder</h2>
    <p>Hi <strong>${name}</strong>, this is a friendly reminder that your payment is pending.</p>
    <div style="background: #141420; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF6B35;">
      <p style="margin: 0 0 8px;"><strong>Team:</strong> ${teamName}</p>
      <p style="margin: 0 0 8px;"><strong>Booking Date:</strong> ${date}</p>
      <p style="margin: 0;"><strong>Amount Outstanding:</strong> <span style="color: #FF6B35; font-size: 18px;">₹${amount}</span></p>
    </div>
    <p style="color: #aaa;">Please settle your due before your next booking. Contact us for any queries.</p>
    <a href="https://eastwelfareturf.vercel.app/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #00e676; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">View My Dashboard</a>
  `);

  await transporter.sendMail({ from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`, to, subject, html });
}

export async function sendSpecialOffer({
  to,
  name,
  offerTitle,
  offerDescription,
  discountPct,
  slotType,
  validUntil,
  bookUrl,
}: {
  to: string;
  name: string;
  offerTitle: string;
  offerDescription: string;
  discountPct: number;
  slotType: string;
  validUntil: string;
  bookUrl?: string;
}) {
  const slotLabel = slotType === "PEAK" ? "Peak (6pm–6am)" : slotType === "OFF_PEAK" ? "Off-Peak (6am–6pm)" : "All Slots";
  const subject = `🎉 Special Offer: ${discountPct}% Off – East Welfare Turf`;
  const targetUrl = bookUrl || "https://eastwelfareturf.vercel.app/book";
  const html = baseTemplate(`
    <h2 style="color: #FFD700; font-size: 22px;">🎉 Exclusive Offer Just For You!</h2>
    <p>Hi <strong>${name}</strong>, we have a special offer for you!</p>
    <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 12px; padding: 24px; margin: 20px 0; border: 2px solid #FFD700; text-align: center;">
      <div style="font-size: 48px; font-weight: 900; color: #FFD700;">${discountPct}% OFF</div>
      <div style="font-size: 22px; font-weight: 800; color: #fff; margin: 8px 0;">${offerTitle}</div>
      <div style="color: #aaa; margin: 8px 0;">${offerDescription}</div>
      <div style="color: #FFD700; font-weight: 600; margin-top: 12px;">Applicable on: ${slotLabel}</div>
      <div style="color: #aaa; font-size: 12px; margin-top: 8px;">Valid until: ${validUntil}</div>
    </div>
    <p style="color: #aaa;">Don't miss out — slots fill up fast!</p>
    <a href="${targetUrl}" style="display: inline-block; margin-top: 16px; padding: 14px 32px; background: #FFD700; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Book Your Slot Now</a>
  `);

  await transporter.sendMail({ from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`, to, subject, html });
}

export async function sendNoShowPenalty({
  to,
  name,
  teamName,
  penaltyAmount,
  date,
}: {
  to: string;
  name: string;
  teamName: string;
  penaltyAmount: number;
  date: string;
}) {
  const subject = "🚫 No-Show Penalty – East Welfare Turf";
  const html = baseTemplate(`
    <h2 style="color: #FF4444; font-size: 22px;">No-Show Penalty Applied</h2>
    <p>Hi <strong>${name}</strong>, we noticed your team did not arrive for the booked slot.</p>
    <div style="background: #141420; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF4444;">
      <p style="margin: 0 0 8px;"><strong>Team:</strong> ${teamName}</p>
      <p style="margin: 0 0 8px;"><strong>Missed Date:</strong> ${date}</p>
      <p style="margin: 0;"><strong>Penalty Due (50%):</strong> <span style="color: #FF4444; font-size: 18px;">₹${penaltyAmount}</span></p>
    </div>
    <p style="color: #aaa;">A 50% no-show penalty has been applied to your account. Please clear this before your next booking.</p>
    <a href="https://eastwelfareturf.vercel.app/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #FF4444; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">View Dashboard</a>
  `);

  await transporter.sendMail({ from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`, to, subject, html });
}

export async function sendCancellationEmail({
  to,
  name,
  teamName,
  date,
  startTime,
  duration,
  reason,
  sport,
}: {
  to: string;
  name: string;
  teamName: string;
  date: string;
  startTime: number;
  duration: number;
  reason?: string;
  sport?: string;
}) {
  const formatHour = (hour: number) => {
    const h = hour % 24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  };
  const subject = reason 
    ? `⚠️ Emergency Booking Cancellation – East Welfare Turf (${date})` 
    : "❌ Booking Cancelled – East Welfare Turf";
  const html = baseTemplate(`
    <h2 style="color: #FF4444; font-size: 22px;">${reason ? "⚠️ Emergency Cancellation" : "Booking Cancelled"}</h2>
    <p>Hi <strong>${name}</strong>, ${reason ? "we regret to inform you that your booking had to be cancelled due to an emergency block." : "your booking has been cancelled."}</p>
    <div style="background: #141420; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF4444;">
      <p style="margin: 0 0 8px;"><strong>Team:</strong> ${teamName}</p>
      <p style="margin: 0 0 8px;"><strong>Date:</strong> ${date}</p>
      <p style="margin: 0 0 8px;"><strong>Time:</strong> ${formatHour(startTime)} – ${formatHour((startTime + duration) % 24)}</p>
      ${reason ? `<p style="margin: 12px 0 0; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.1); color: #FF8B8B; font-size: 14px;"><strong>Reason for Block:</strong> ${reason}</p>` : ''}
    </div>
    <p style="color: #aaa; font-size: 14px;">${reason ? 'We deeply apologize for this inconvenience. You can view other available slots and book a new session directly on our website.' : `Your slot has been released. We hope to see you on the pitch next time! ${sport === 'CRICKET' ? '🏏' : '⚽'}`}</p>
    <a href="https://eastwelfareturf.vercel.app/book" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #FF4444; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">📅 Book a New Session</a>
  `);

  await transporter.sendMail({ from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`, to, subject, html });
}

const ADMIN_EMAIL = 'eastwelfareturf@gmail.com';

export async function sendAdminBookingAlert({
  userName,
  userEmail,
  teamName,
  date,
  startTime,
  duration,
  amount,
  sport,
}: {
  userName: string;
  userEmail: string;
  teamName: string;
  date: string;
  startTime: number;
  duration: number;
  amount: number;
  sport?: string;
}) {
  const formatHour = (hour: number) => {
    const h = hour % 24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  };
  const subject = `New Booking: ${teamName} - ${date}`;
  const html = baseTemplate(`
    <h2 style="color: #00b0ff; font-size: 22px;">New Booking Received!</h2>
    <p>A new slot has just been booked.</p>
    <div style="background: #141420; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #00b0ff;">
      <p style="margin: 0 0 8px;"><strong>Team:</strong> ${teamName}</p>
      <p style="margin: 0 0 8px;"><strong>Booked By:</strong> ${userName} (${userEmail})</p>
      <p style="margin: 0 0 8px;"><strong>Date:</strong> ${date}</p>
      <p style="margin: 0 0 8px;"><strong>Sport:</strong> ${sport === 'CRICKET' ? 'Cricket 🏏' : 'Football ⚽'}</p>
      <p style="margin: 0 0 8px;"><strong>Time:</strong> ${formatHour(startTime)} to ${formatHour((startTime + duration) % 24)}</p>
      <p style="margin: 0 0 8px;"><strong>Duration:</strong> ${duration} hour(s)</p>
      <p style="margin: 0;"><strong>Amount Due:</strong> <span style="color: #00e676; font-size: 18px;">Rs.${amount}</span></p>
    </div>
    <a href="https://eastwelfareturf.vercel.app/admin" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #00b0ff; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">Open Admin Dashboard</a>
  `);
  await transporter.sendMail({ from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`, to: ADMIN_EMAIL, subject, html });
}

export async function sendAdminCancellationAlert({
  userName,
  userEmail,
  teamName,
  date,
  startTime,
  duration,
}: {
  userName: string;
  userEmail: string;
  teamName: string;
  date: string;
  startTime: number;
  duration: number;
}) {
  const formatHour = (hour: number) => {
    const h = hour % 24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  };
  const subject = `Booking Cancelled: ${teamName} - ${date}`;
  const html = baseTemplate(`
    <h2 style="color: #FF4444; font-size: 22px;">Booking Cancelled</h2>
    <p>A booking was cancelled. The slot is now free again.</p>
    <div style="background: #141420; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF4444;">
      <p style="margin: 0 0 8px;"><strong>Team:</strong> ${teamName}</p>
      <p style="margin: 0 0 8px;"><strong>Cancelled By:</strong> ${userName} (${userEmail})</p>
      <p style="margin: 0 0 8px;"><strong>Date:</strong> ${date}</p>
      <p style="margin: 0;"><strong>Time:</strong> ${formatHour(startTime)} to ${formatHour((startTime + duration) % 24)}</p>
    </div>
    <a href="https://eastwelfareturf.vercel.app/admin" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #FF4444; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Open Admin Dashboard</a>
  `);
  await transporter.sendMail({ from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`, to: ADMIN_EMAIL, subject, html });
}

export async function sendOfferAnnouncement({
  toList,
  offerTitle,
  description,
  discountPct,
  slotType,
  startDate,
  endDate,
}: {
  toList: string[];
  offerTitle: string;
  description: string;
  discountPct: number;
  slotType: string;
  startDate: string;
  endDate: string;
}) {
  const slotLabel =
    slotType === 'PEAK' ? 'Evening/Night slots (6 PM – 6 AM)' :
    slotType === 'OFF_PEAK' ? 'Day slots (6 AM – 6 PM)' :
    'All slots (Day & Night)';

  const subject = `${discountPct}% OFF at East Welfare Turf — ${offerTitle}`;
  const html = baseTemplate(`
    <h2 style="color: #FFD700; font-size: 24px;">🎉 Special Offer Alert!</h2>
    <p style="font-size: 16px; margin-bottom: 8px;">We have an exciting offer just for you!</p>

    <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 16px; padding: 24px; margin: 20px 0; border: 2px solid #FFD700; text-align: center;">
      <div style="font-size: 48px; font-weight: 900; color: #FFD700;">${discountPct}% OFF</div>
      <div style="font-size: 22px; font-weight: 700; color: #fff; margin-top: 8px;">${offerTitle}</div>
      ${description ? `<div style="color: rgba(255,255,255,0.7); margin-top: 8px; font-size: 14px;">${description}</div>` : ''}
    </div>

    <div style="background: #141420; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 8px;"><strong>Valid Slots:</strong> ${slotLabel}</p>
      <p style="margin: 0 0 8px;"><strong>Valid From:</strong> ${startDate}</p>
      <p style="margin: 0;"><strong>Valid Until:</strong> ${endDate}</p>
    </div>

    <p style="color: rgba(255,255,255,0.7);">Hurry — limited slots available at this price!</p>
    <a href="https://eastwelfareturf.vercel.app/book" style="display: inline-block; margin-top: 16px; padding: 14px 32px; background: #FFD700; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">⚽ Book Now</a>
  `);

  // Send individually to avoid spam filters blocking bulk "to" lists
  for (const email of toList) {
    try {
      await transporter.sendMail({
        from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject,
        html,
      });
    } catch (e) {
      console.error(`Failed to send offer email to ${email}:`, e);
    }
  }
}

export async function sendBlockAnnouncement({
  toList,
  date,
  startTime,
  endTime,
  reason,
}: {
  toList: string[];
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}) {
  const subject = `⚠️ Emergency Slot Block – East Welfare Turf (${date})`;
  const html = baseTemplate(`
    <h2 style="color: #FF4444; font-size: 22px;">⚠️ Emergency Turf Block</h2>
    <p>We regret to inform you that the turf has been temporarily blocked due to an emergency.</p>
    <div style="background: #1a0000; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF4444;">
      <p style="margin: 0 0 8px;"><strong>Date:</strong> ${date}</p>
      <p style="margin: 0 0 8px;"><strong>Blocked Time:</strong> ${startTime} – ${endTime}</p>
      <p style="margin: 0;"><strong>Reason:</strong> <span style="color: #FF6B6B;">${reason}</span></p>
    </div>
    <p style="color: #aaa;">We apologise for the inconvenience. Please avoid booking during this period. Any overlapping bookings have been cancelled automatically.</p>
    <a href="https://eastwelfareturf.vercel.app/book" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#FF4444;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">View Available Slots</a>
  `);

  for (const email of toList) {
    try {
      await transporter.sendMail({
        from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject,
        html,
      });
    } catch (e) {
      console.error(`Block email failed for ${email}:`, e);
    }
  }
}

export async function sendBlockCancelledAnnouncement({
  toList,
  date,
  reason,
}: {
  toList: string[];
  date: string;
  reason: string;
}) {
  const subject = `✅ Block Lifted – East Welfare Turf (${date})`;
  const html = baseTemplate(`
    <h2 style="color: #00E676; font-size: 22px;">✅ Slot Block Has Been Lifted</h2>
    <p>Good news! The previously scheduled block has been <strong>cancelled</strong> and the turf is now available again.</p>
    <div style="background: #141420; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #00E676;">
      <p style="margin: 0 0 8px;"><strong>Date Affected:</strong> ${date}</p>
      <p style="margin: 0;"><strong>Original Reason:</strong> <span style="color: rgba(255,255,255,0.6);">${reason}</span></p>
    </div>
    <p style="color: #aaa;">You can now book slots for this date as normal. We apologise for any earlier inconvenience.</p>
    <a href="https://eastwelfareturf.vercel.app/book" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00E676;color:#000;text-decoration:none;border-radius:8px;font-weight:bold;">Book Your Slot</a>
  `);

  for (const email of toList) {
    try {
      await transporter.sendMail({
        from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject,
        html,
      });
    } catch (e) {
      console.error(`Block cancel email failed for ${email}:`, e);
    }
  }
}

export async function sendBlockEndedAnnouncement({
  toList,
  date,
  reason,
}: {
  toList: string[];
  date: string;
  reason: string;
}) {
  const subject = `✅ Scheduled Block Concluded – Turf is Open`;
  const html = baseTemplate(`
    <h2 style="color: #00E676; font-size: 22px;">✅ Turf is Available Now</h2>
    <p>The previously scheduled block has successfully ended, and the turf is fully open for new bookings!</p>
    <div style="background: #141420; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #00E676;">
      <p style="margin: 0 0 8px;"><strong>Date:</strong> ${date}</p>
      <p style="margin: 0;"><strong>Concluded Block:</strong> <span style="color: rgba(255,255,255,0.6);">${reason}</span></p>
    </div>
    <p style="color: #aaa;">You can now book any upcoming available slots as usual. We look forward to seeing you!</p>
    <a href="https://eastwelfareturf.vercel.app/book" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00E676;color:#000;text-decoration:none;border-radius:8px;font-weight:bold;">Book Your Slot</a>
  `);

  // Send individually
  for (const email of toList) {
    try {
      await transporter.sendMail({
        from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject,
        html,
      });
    } catch (e) {
      console.error(`Block ended email failed for ${email}:`, e);
    }
  }
}

export async function sendSlotReminder({
  to,
  name,
  teamName,
  date,
  startTime,
  duration,
  amount,
}: {
  to: string;
  name: string;
  teamName: string;
  date: string;
  startTime: number;
  duration: number;
  amount: number;
}) {
  const formatHour = (hour: number) => {
    const h = hour % 24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  };

  const subject = `⏰ Reminder: Your slot starts in 10 minutes! – East Welfare Turf`;
  const html = baseTemplate(`
    <h2 style="color: #FFD700; font-size: 22px;">⏰ Your Slot Starts in 10 Minutes!</h2>
    <p>Hi <strong>${name}</strong>, this is a friendly reminder that your turf slot is starting in 10 minutes!</p>
    <div style="background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,140,0,0.05)); border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #FFD700;">
      <p style="margin: 0 0 8px;"><strong>Team:</strong> ${teamName}</p>
      <p style="margin: 0 0 8px;"><strong>Date:</strong> ${date}</p>
      <p style="margin: 0 0 8px;"><strong>Time:</strong> ${formatHour(startTime)} – ${formatHour((startTime + duration) % 24)}</p>
      <p style="margin: 0 0 8px;"><strong>Duration:</strong> ${duration} hour(s)</p>
      <p style="margin: 0;"><strong>Amount Due at Venue:</strong> <span style="color: #FFD700; font-size: 18px;">₹${amount}</span></p>
    </div>
    <p style="color: #aaa; font-size: 15px;">🏃 Please arrive <strong style="color: #fff;">10 minutes early</strong> to warm up. Payment is collected at the venue.</p>
    <p style="color: #aaa; font-size: 13px;">📍 Mannar East Welfare School, Kerala</p>
  `);

  await transporter.sendMail({
    from: `"East Welfare Turf" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}
