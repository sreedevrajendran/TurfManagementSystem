/**
 * Generates a modern styled receipt as a PNG data URL using HTML Canvas.
 */
export interface ReceiptData {
  teamName: string;
  sport: string;
  date: string;
  time: string;
  duration: number;
  phone: string;
  amount: number;
  bookingId?: string;
  paymentStatus?: 'CONFIRMED' | 'PENDING' | 'DUE' | 'CANCELLED';
  cancelReason?: string | null;
}

export function generateReceiptImage(data: ReceiptData): string {
  const W = 640;
  const H = 860;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2;   // 2x for retina
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // ── Background ──────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#07070E');
  bg.addColorStop(1, '#0f0f1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Glowing accent strip at top ─────────────────────────────
  const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
  headerGrad.addColorStop(0, '#00c853');
  headerGrad.addColorStop(0.5, '#00e676');
  headerGrad.addColorStop(1, '#69f0ae');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, W, 6);

  // ── Card background ──────────────────────────────────────────
  const cardY = 32;
  const cardX = 32;
  const cardW = W - 64;
  const cardH = H - 64;
  roundRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Logo / Header area ───────────────────────────────────────
  ctx.font = 'bold 44px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('⚽   🏏', W / 2, 110);

  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#00e676';
  ctx.fillText('EAST WELFARE TURF', W / 2, 148);

  ctx.font = '13px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Mannar · +91 97785 18909', W / 2, 170);

  // ── Divider ──────────────────────────────────────────────────
  dashedLine(ctx, cardX + 24, 192, cardX + cardW - 24, 192, 'rgba(255,255,255,0.12)');

  // ── "BOOKING RECEIPT" label ──────────────────────────────────
  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.letterSpacing = '3px';
  ctx.fillText('BOOKING RECEIPT', W / 2, 218);
  ctx.letterSpacing = '0px';

  // ── Team name (big) ──────────────────────────────────────────
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(data.teamName.toUpperCase(), W / 2, 264);

  // ── Sport badge ──────────────────────────────────────────────
  const badgeW = 120;
  const badgeX = W / 2 - badgeW / 2;
  roundRect(ctx, badgeX, 278, badgeW, 30, 15);
  ctx.fillStyle = data.sport === 'Cricket' ? 'rgba(0, 176, 255, 0.15)' : 'rgba(0, 230, 118, 0.15)';
  ctx.fill();
  ctx.strokeStyle = data.sport === 'Cricket' ? 'rgba(0, 176, 255, 0.4)' : 'rgba(0, 230, 118, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = 'bold 12px Arial';
  ctx.fillStyle = data.sport === 'Cricket' ? '#00b0ff' : '#00e676';
  ctx.fillText(data.sport.toUpperCase(), W / 2, 298);

  // ── Divider ──────────────────────────────────────────────────
  dashedLine(ctx, cardX + 24, 328, cardX + cardW - 24, 328, 'rgba(255,255,255,0.12)');

  // ── Details rows ─────────────────────────────────────────────
  const rows: [string, string][] = [
    ['📅  Date', data.date],
    ['🕐  Time', data.time],
    ['⏱  Duration', `${data.duration} Hour${data.duration > 1 ? 's' : ''}`],
  ];

  if (data.phone && data.phone.trim() !== '' && !data.phone.startsWith('USER-')) {
    rows.push(['📱  Phone No', data.phone.trim()]);
  }

  let rowY = 360;
  for (const [label, value] of rows) {
    // Label
    ctx.font = '13px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(label, cardX + 40, rowY);

    // Value
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(value, cardX + cardW - 40, rowY);

    rowY += 48;
  }

  // ── Amount block ─────────────────────────────────────────────
  const amtY = rowY + 10;
  roundRect(ctx, cardX + 24, amtY, cardW - 48, 80, 16);
  const amtGrad = ctx.createLinearGradient(cardX + 24, amtY, cardX + cardW - 24, amtY);
  amtGrad.addColorStop(0, 'rgba(0,230,118,0.12)');
  amtGrad.addColorStop(1, 'rgba(0,200,83,0.06)');
  ctx.fillStyle = amtGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,230,118,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '12px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText('TOTAL AMOUNT DUE AT VENUE', W / 2, amtY + 26);
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#00e676';
  ctx.fillText(`₹${data.amount.toLocaleString('en-IN')}`, W / 2, amtY + 62);

  // ── Divider ──────────────────────────────────────────────────
  dashedLine(ctx, cardX + 24, amtY + 100, cardX + cardW - 24, amtY + 100, 'rgba(255,255,255,0.12)');

  // ── Footer ───────────────────────────────────────────────────
  const footerY = amtY + 128;
  ctx.font = '12px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.textAlign = 'center';
  ctx.fillText('Thank you for booking with us!', W / 2, footerY);
  ctx.fillText('Please pay at the venue before your slot.', W / 2, footerY + 20);

  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = 'rgba(0,230,118,0.5)';
  ctx.fillText('eastwelfareturf.vercel.app', W / 2, footerY + 50);

  // ── Payment Status Stamp ─────────────────────────────────────
  if (data.paymentStatus) {
    const stampConfig = {
      CONFIRMED: { text: '✓ PAYMENT CONFIRMED', color: '#00e676', border: 'rgba(0,230,118,0.6)', bg: 'rgba(0,230,118,0.1)' },
      PENDING:   { text: '⏳ PAYMENT PENDING',  color: '#FFAB00', border: 'rgba(255,171,0,0.6)',  bg: 'rgba(255,171,0,0.1)' },
      DUE:       { text: '⚠ PAYMENT DUE',       color: '#FF4444', border: 'rgba(255,68,68,0.6)',  bg: 'rgba(255,68,68,0.1)' },
      CANCELLED: { text: '✕ BOOKING CANCELLED', color: '#9e9e9e', border: 'rgba(158,158,158,0.6)', bg: 'rgba(158,158,158,0.1)' },
    }[data.paymentStatus];

    const stampW = 240;
    const stampH = 36;
    const stampX = W / 2 - stampW / 2;
    const stampY = footerY + 68;

    roundRect(ctx, stampX, stampY, stampW, stampH, 8);
    ctx.fillStyle = stampConfig.bg;
    ctx.fill();
    ctx.strokeStyle = stampConfig.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = stampConfig.color;
    ctx.textAlign = 'center';
    ctx.fillText(stampConfig.text, W / 2, stampY + 23);

    if (data.cancelReason) {
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#ff4444';
      ctx.fillText(data.cancelReason, W / 2, stampY + 50);
    }
  }

  // ── Bottom accent strip ──────────────────────────────────────
  const botGrad = ctx.createLinearGradient(0, H - 6, W, H - 6);
  botGrad.addColorStop(0, '#00c853');
  botGrad.addColorStop(0.5, '#00e676');
  botGrad.addColorStop(1, '#69f0ae');
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, H - 6, W, 6);

  return canvas.toDataURL('image/png');
}

// Helpers
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function dashedLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
  ctx.save();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export interface OfferImageData {
  title: string;
  priceText: string;
  slotType: string;
  validUntil: string;
}

export function generateOfferImage(data: OfferImageData): string {
  const W = 640;
  const H = 860;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a0a00');
  bg.addColorStop(1, '#1a1300');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
  headerGrad.addColorStop(0, '#ffd700');
  headerGrad.addColorStop(0.5, '#ffaa00');
  headerGrad.addColorStop(1, '#ffd700');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, W, 6);

  const cardY = 32;
  const cardX = 32;
  const cardW = W - 64;
  const cardH = H - 64;
  roundRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,215,0,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = 'bold 44px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('⚽   🏏', W / 2, 110);

  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#ffd700';
  ctx.fillText('EAST WELFARE TURF', W / 2, 148);

  ctx.font = '13px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Mannar · +91 97785 18909', W / 2, 170);

  dashedLine(ctx, cardX + 24, 192, cardX + cardW - 24, 192, 'rgba(255,215,0,0.15)');

  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = '#ffaa00';
  ctx.letterSpacing = '3px';
  ctx.fillText('SPECIAL OFFER', W / 2, 218);
  ctx.letterSpacing = '0px';

  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#ffffff';
  let title = data.title.toUpperCase();
  if (title.length > 20) {
    ctx.fillText(title.substring(0, 20), W / 2, 270);
    ctx.fillText(title.substring(20), W / 2, 315);
  } else {
    ctx.fillText(title, W / 2, 280);
  }

  dashedLine(ctx, cardX + 24, 350, cardX + cardW - 24, 350, 'rgba(255,215,0,0.15)');

  const amtY = 380;
  roundRect(ctx, cardX + 24, amtY, cardW - 48, 110, 16);
  const amtGrad = ctx.createLinearGradient(cardX + 24, amtY, cardX + cardW - 24, amtY);
  amtGrad.addColorStop(0, 'rgba(255,215,0,0.15)');
  amtGrad.addColorStop(1, 'rgba(255,170,0,0.08)');
  ctx.fillStyle = amtGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,215,0,0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '14px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('OFFER PRICING', W / 2, amtY + 35);
  
  ctx.font = 'bold 44px Arial';
  ctx.fillStyle = '#00e676';
  ctx.fillText(data.priceText, W / 2, amtY + 82);

  let rowY = 540;
  const rows: [string, string][] = [
    ['⏱  Valid For', data.slotType === 'BOTH' ? 'All Slots' : data.slotType === 'PEAK' ? 'Night/Peak Slots' : 'Morning/Off-Peak'],
    ['📅  Valid Until', data.validUntil],
  ];

  for (const [label, value] of rows) {
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(label, cardX + 40, rowY);

    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(value, cardX + cardW - 40, rowY);
    rowY += 56;
  }

  const footerY = 740;
  ctx.textAlign = 'center';
  ctx.font = '13px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Book now before the offer expires!', W / 2, footerY);
  
  ctx.font = 'bold 12px Arial';
  ctx.fillStyle = '#ffaa00';
  ctx.fillText('eastwelfareturf.vercel.app', W / 2, footerY + 30);

  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, H - 6, W, 6);

  return canvas.toDataURL('image/png');
}

export interface BlockImageData {
  dateLabel: string;
  timeLabel: string;
  reason: string;
}

export function generateBlockImage(data: BlockImageData): string {
  const W = 640;
  const H = 860;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0f0505');
  bg.addColorStop(1, '#1f0a0a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
  headerGrad.addColorStop(0, '#ff4444');
  headerGrad.addColorStop(0.5, '#ff8888');
  headerGrad.addColorStop(1, '#ff4444');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, W, 6);

  const cardY = 32;
  const cardX = 32;
  const cardW = W - 64;
  const cardH = H - 64;
  roundRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,68,68,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = 'bold 44px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('⚽   🏏', W / 2, 110);

  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#ff4444';
  ctx.fillText('EAST WELFARE TURF', W / 2, 148);

  ctx.font = '13px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Mannar · +91 97785 18909', W / 2, 170);

  dashedLine(ctx, cardX + 24, 192, cardX + cardW - 24, 192, 'rgba(255,68,68,0.2)');

  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = '#ff8888';
  ctx.letterSpacing = '3px';
  ctx.fillText('TURF UPDATE', W / 2, 218);
  ctx.letterSpacing = '0px';

  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('TURF CLOSED', W / 2, 275);

  dashedLine(ctx, cardX + 24, 320, cardX + cardW - 24, 320, 'rgba(255,68,68,0.2)');

  const rows: [string, string][] = [
    ['📅  Date', data.dateLabel],
    ['🕐  Time', data.timeLabel],
  ];

  let rowY = 360;
  for (const [label, value] of rows) {
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(label, cardX + 40, rowY);

    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(value, cardX + cardW - 40, rowY);
    rowY += 56;
  }

  const amtY = rowY + 10;
  roundRect(ctx, cardX + 24, amtY, cardW - 48, 120, 16);
  const amtGrad = ctx.createLinearGradient(cardX + 24, amtY, cardX + cardW - 24, amtY);
  amtGrad.addColorStop(0, 'rgba(255,68,68,0.15)');
  amtGrad.addColorStop(1, 'rgba(255,68,68,0.05)');
  ctx.fillStyle = amtGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,68,68,0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '13px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('REASON FOR CLOSURE', W / 2, amtY + 35);
  
  ctx.font = 'bold 26px Arial';
  ctx.fillStyle = '#ff8888';
  let reason = data.reason.toUpperCase();
  if (reason.length > 25) {
    ctx.fillText(reason.substring(0, 25), W / 2, amtY + 75);
    ctx.fillText(reason.substring(25), W / 2, amtY + 105);
  } else {
    ctx.fillText(reason, W / 2, amtY + 85);
  }

  const footerY = 740;
  ctx.textAlign = 'center';
  ctx.font = '13px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Sorry for the inconvenience.', W / 2, footerY);
  
  ctx.font = 'bold 12px Arial';
  ctx.fillStyle = '#ff4444';
  ctx.fillText('eastwelfareturf.vercel.app', W / 2, footerY + 30);

  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, H - 6, W, 6);

  return canvas.toDataURL('image/png');
}
