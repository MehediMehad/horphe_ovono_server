import config from '../config';
import nodemailer from 'nodemailer';
import smtpTransporter from 'nodemailer-smtp-transport';

interface Attachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType: string;
}

/**
 * Sends an email using configured SMTP transporter.
 */
const sentEmailUtility = async (
  to: string,
  subject: string,
  htmlContent: string = '',
  textContent: string = '',
  attachments?: Attachment[]
): Promise<void> => {
  const transporter = nodemailer.createTransport(
    smtpTransporter({
      host: 'mail.hasanmajedul.com',
      port: 465,
      secure: true,
      auth: {
        user: config.emailSender.email,
        pass: config.emailSender.app_pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );

  const mailOptions = {
    from: 'no-reply@hasanmajedul.com',
    to,
    subject,
    text: textContent,
    html: htmlContent,
    attachments: attachments || [],
  };

  await transporter.sendMail(mailOptions);
};

export default sentEmailUtility;
