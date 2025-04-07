import crypto from "crypto";
import sentEmailUtility from "../../utils/sentEmailUtility";
import { emailText } from "../../utils/emailTemplate";

// Function to generate OTP and expiry for a user
export const generateOTP = () => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  const hexCode = crypto.randomBytes(16).toString("hex");
  return { otpCode, expiry, hexCode };
};

export const saveOrUpdateOTP = async (email: string, otpCode: string, expiry: Date, identifier: string, prisma: any) => {
    return await prisma.otp.upsert({
      where: { email },
      update: { otp: otpCode, expiry, hexCode: identifier },
      create: { email, otp: otpCode, expiry, hexCode: identifier },
    });
  };

  /**
 * Sends OTP email to a user.
 */
export const sendOTPEmail = async (email: string, otpCode: string): Promise<void> => {
  const subject = 'Verify Your Email';
  const htmlBody = emailText(subject, otpCode);
  const textFallback = `Your OTP code is: ${otpCode}`;

  await sentEmailUtility(email, subject, htmlBody, textFallback);
};