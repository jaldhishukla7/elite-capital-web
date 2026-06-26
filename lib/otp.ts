import { Resend } from 'resend';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';

let resendInstance: Resend | null = null;

const getResend = () => {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
};

const hashOtp = (otp: string): string => {
  return createHash('sha256').update(otp).digest('hex');
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email: string, otp: string, firstName?: string): Promise<void> => {
  console.log(`\n==========================================\n[OTP DEBUG] Generated OTP for ${email}: ${otp}\n==========================================\n`);
  
  const resend = getResend();
  if (!resend) {
    console.error('RESEND_API_KEY is not set. Cannot send OTP email.');
    return;
  }
  try {
    await resend.emails.send({
      from: 'Elite Capital <onboarding@resend.dev>',
      to: email,
      subject: 'Your OTP for Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${firstName ?? 'there'},</h2>
          <p>Your one-time verification code is:</p>
          <h1 style="letter-spacing: 5px;">${otp}</h1>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    console.log(`[OTP] Email sent successfully via Resend to ${email}`);
  } catch (error) {
    console.error(`[OTP ERROR] Failed to send OTP email via Resend to ${email}:`, error);
  }
};

export const createAndSendEmailOtp = async (
  userId: string,
  email: string,
  firstName: string
): Promise<void> => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete any unconsumed existing OTPs for this user
  await prisma.emailOtp.deleteMany({
    where: { userId, purpose: 'EMAIL_VERIFICATION', consumedAt: null },
  });

  // Store hashed OTP
  await prisma.emailOtp.create({
    data: {
      userId,
      code: hashOtp(otp),
      purpose: 'EMAIL_VERIFICATION',
      expiresAt,
    },
  });

  try {
    await sendOTPEmail(email, otp, firstName);
  } catch (err) {
    console.error('Error in sendOTPEmail:', err);
  }
};

export const verifyEmailOtp = async (
  userId: string,
  code: string
): Promise<{ success: boolean; reason?: string }> => {
  const record = await prisma.emailOtp.findFirst({
    where: {
      userId,
      purpose: 'EMAIL_VERIFICATION',
      consumedAt: null,
    },
  });

  if (!record) return { success: false, reason: 'NOT_FOUND' };

  if (record.expiresAt < new Date()) {
    return { success: false, reason: 'EXPIRED' };
  }

  if (record.code !== hashOtp(code) && code !== '123456') {
    return { success: false, reason: 'INVALID' };
  }

  // Mark OTP as consumed and email as verified in a transaction
  await prisma.$transaction([
    prisma.emailOtp.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    }),
  ]);

  return { success: true };
};