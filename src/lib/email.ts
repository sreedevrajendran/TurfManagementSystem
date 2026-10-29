import nodemailer from 'nodemailer';
import { escapeHtml } from './sanitize';

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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'eastwelfareturf@gmail.com';

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

  const safeDate = escapeHtml(bookingDetails.date);
  const safeTime = escapeHtml(bookingDetails.startTime);
  const safeCourt = escapeHtml(bookingDetails.court);
  const safeUserName = escapeHtml(bookingDetails.userName || 'N/A');
  const safeUserEmail = escapeHtml(bookingDetails.userEmail || 'N/A');
  const safePhone = escapeHtml(bookingDetails.phone || 'N/A');
  const safePrice = Number(bookingDetails.totalPrice) || 0;
  const safeDuration = Number(bookingDetails.durationHours) || 1;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `New Booking Alert - ${safeDate} (${safeTime})`,
    html: `
      <h2>New Booking Received!</h2>
      <p>A new booking has been confirmed.</p>
      <ul>
        <li><strong>Date:</strong> ${safeDate}</li>
        <li><strong>Time:</strong> ${safeTime}</li>
        <li><strong>Duration:</strong> ${safeDuration} Hour(s)</li>
        <li><strong>Court:</strong> ${safeCourt}</li>
        <li><strong>Total Price:</strong> ₹${safePrice}</li>
      </ul>
      <h3>Customer Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${safeUserName}</li>
        <li><strong>Email:</strong> ${safeUserEmail}</li>
        <li><strong>Phone:</strong> ${safePhone}</li>
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
  phone?: string | null;
}) => {
  const transporter = getTransporter();
  if (!transporter) return;

  const safeDate = escapeHtml(bookingDetails.date);
  const safeTime = escapeHtml(bookingDetails.startTime);
  const safeCourt = escapeHtml(bookingDetails.court);
  const safeUserName = escapeHtml(bookingDetails.userName || 'N/A');
  const safeUserEmail = escapeHtml(bookingDetails.userEmail || 'N/A');
  const safePhone = escapeHtml(bookingDetails.phone || 'N/A');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `Booking Cancelled - ${safeDate} (${safeTime})`,
    html: `
      <h2>Booking Cancelled</h2>
      <p>A booking has been cancelled.</p>
      <ul>
        <li><strong>Date:</strong> ${safeDate}</li>
        <li><strong>Time:</strong> ${safeTime}</li>
        <li><strong>Court:</strong> ${safeCourt}</li>
      </ul>
      <h3>Customer Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${safeUserName}</li>
        <li><strong>Email:</strong> ${safeUserEmail}</li>
        <li><strong>Phone:</strong> ${safePhone}</li>
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
