import nodemailer from 'nodemailer';

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    }
});

/**
 * Send email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    const fromEmail = process.env.SMTP_USER;

    if (!fromEmail) {
        throw new Error('SMTP_USER environment variable is not set');
    }

    const mailOptions = {
        from: `"KL Unity" <${fromEmail}>`,
        to,
        subject,
        html,
        text
    };

    console.log('📧 Attempting to send email via SMTP:', {
        to,
        from: fromEmail,
        subject,
        host: process.env.SMTP_HOST
    });

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} name - User name
 */
export const sendOTPEmail = async (to, otp, name) => {
    const subject = 'Your Verification Code - KL Unity';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Welcome to KL Unity!</h1>
        <p>Hi ${name},</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #000; letter-spacing: 5px; font-size: 32px; margin: 0;">${otp}</h2>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create this account, please ignore this email.</p>
    </div>
    `;

    return sendEmail({ to, subject, html });
};
