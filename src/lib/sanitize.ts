/**
 * Security sanitization utilities
 * Protects against XSS, HTML injection, prompt injection, and context poisoning.
 */

// Escape HTML special characters to prevent HTML/XSS injection in rendered templates/emails
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Patterns commonly used in prompt injection and goal hijacking attacks
const PROMPT_INJECTION_PATTERNS = [
  /\[\s*system\s*\]/gi,
  /\[\s*instruction\s*\]/gi,
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
  /system\s*:\s*/gi,
  /assistant\s*:\s*/gi,
  /human\s*:\s*/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /<\/?[a-z][\s\S]*>/gi, // Strip any HTML/XML tags
];

/**
 * Sanitizes plain text input (e.g. team name, notes, reasons).
 * - Strips control characters and null bytes
 * - Neutralizes prompt injection phrases and HTML tags
 * - Trims and enforces max length
 */
export function sanitizeText(input: unknown, maxLength = 100): string {
  if (typeof input !== 'string') return '';
  
  // Remove ASCII control characters, null bytes, and non-printable characters
  let cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip known injection tags and prompt injection indicators
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, ' ');
  }

  // Collapse multiple whitespaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Enforce max length
  return cleaned.slice(0, maxLength);
}

/**
 * Validates and formats phone numbers to strictly digits.
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return '';
}

/**
 * Constant-time string comparison to prevent timing attacks on secrets
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
