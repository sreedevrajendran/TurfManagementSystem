import nodemailer from 'nodemailer';

// Helper to get transporter
const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS not set, email will not be sent');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const ADMIN_EMAIL = 'eastwelfareturf@gmail.com';

export const sendAdminNewBookingNotification = async (bookingDetails: {
  date: string;
  startTime: string;
  durationHours: number;
  totalPrice: number;
  court: string;
  userName?: string | null;
  userEmail?: string | null;
  phone?: string | null;
}) => {
  const transporter = getTransporter();
  if (!transporter) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `New Booking Alert - ${bookingDetails.date} (${bookingDetails.startTime})`,
    html: `
      <h2>New Booking Received!</h2>
      <p>A new booking has been confirmed.</p>
      <ul>
        <li><strong>Date:</strong> ${bookingDetails.date}</li>
        <li><strong>Time:</strong> ${bookingDetails.startTime}</li>
        <li><strong>Duration:</strong> ${bookingDetails.durationHours} Hour(s)</li>
        <li><strong>Court:</strong> ${bookingDetails.court}</li>
        <li><strong>Total Price:</strong> ₹${bookingDetails.totalPrice}</li>
      </ul>
      <h3>Customer Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${bookingDetails.userName || 'N/A'}</li>
        <li><strong>Email:</strong> ${bookingDetails.userEmail || 'N/A'}</li>
        <li><strong>Phone:</strong> ${bookingDetails.phone || 'N/A'}</li>
      </ul>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notified about new booking');
  } catch (error) {
    console.error('Error sending new booking admin email:', error);
  }
};

export const sendAdminCancelBookingNotification = async (bookingDetails: {
  date: string;
  startTime: string;
  court: string;
  userName?: string | null;
  userEmail?: string | null;
}) => {
  const transporter = getTransporter();
  if (!transporter) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `Booking Cancelled - ${bookingDetails.date} (${bookingDetails.startTime})`,
    html: `
      <h2>Booking Cancelled</h2>
      <p>A booking has been cancelled.</p>
      <ul>
        <li><strong>Date:</strong> ${bookingDetails.date}</li>
        <li><strong>Time:</strong> ${bookingDetails.startTime}</li>
        <li><strong>Court:</strong> ${bookingDetails.court}</li>
      </ul>
      <h3>Customer Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${bookingDetails.userName || 'N/A'}</li>
        <li><strong>Email:</strong> ${bookingDetails.userEmail || 'N/A'}</li>
      </ul>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notified about cancelled booking');
  } catch (error) {
    console.error('Error sending cancel booking admin email:', error);
  }
};
