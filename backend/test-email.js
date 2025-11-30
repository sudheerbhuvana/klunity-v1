import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing SMTP Email Configuration...');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);
console.log('Pass:', process.env.SMTP_PASS ? 'Set' : 'Not Set');

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

const sendTestEmail = async () => {
    const mailOptions = {
        from: `"KL Unity Debugger" <${process.env.SMTP_USER}>`,
        to: '2400033108@kluniversity.in', // User's college email
        subject: 'Test Email from KL Unity (SMTP)',
        text: 'If you receive this, SMTP is working correctly via Office365/Outlook.',
        html: '<b>If you receive this, SMTP is working correctly via Office365/Outlook.</b>'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

sendTestEmail();
