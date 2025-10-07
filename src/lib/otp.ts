// Twilio import is conditional to avoid client-side bundling issues
let twilio: any = null;
if (typeof window === 'undefined') {
  // Only import in server-side environment
  try {
    twilio = require('twilio');
  } catch (error) {
    console.warn('Twilio not available');
  }
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  console.warn('Twilio credentials not configured');
}

const client = (accountSid && authToken && twilio) ? twilio(accountSid, authToken) : null;

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP for verification
export function storeOTP(phoneNumber: string, otp: string): void {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(phoneNumber, { otp, expiresAt, attempts: 0 });
}

// Get stored OTP data
export function getStoredOTP(phoneNumber: string): { otp: string; expiresAt: number; attempts: number } | null {
  const data = otpStore.get(phoneNumber);
  if (!data) return null;

  // Check if expired
  if (Date.now() > data.expiresAt) {
    otpStore.delete(phoneNumber);
    return null;
  }

  return data;
}

// Verify OTP
export function verifyOTP(phoneNumber: string, providedOTP: string): { success: boolean; error?: string } {
  const data = getStoredOTP(phoneNumber);
  if (!data) {
    return { success: false, error: 'OTP expired or not found' };
  }

  // Check max attempts (3 attempts)
  if (data.attempts >= 3) {
    otpStore.delete(phoneNumber);
    return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
  }

  // Increment attempts
  data.attempts++;
  otpStore.set(phoneNumber, data);

  if (data.otp === providedOTP) {
    otpStore.delete(phoneNumber); // Remove after successful verification
    return { success: true };
  }

  return { success: false, error: 'Invalid OTP' };
}

// Send OTP via SMS
export async function sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
  if (!client) {
    console.error('Twilio client not initialized');
    return false;
  }

  try {
    await client.messages.create({
      body: `Your BusinessMatch verification code is: ${otp}. This code will expire in 10 minutes.`,
      from: fromNumber,
      to: phoneNumber,
    });
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
}

// Cleanup expired OTPs (call this periodically)
export function cleanupExpiredOTPs(): void {
  const now = Date.now();
  for (const [phoneNumber, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phoneNumber);
    }
  }
}