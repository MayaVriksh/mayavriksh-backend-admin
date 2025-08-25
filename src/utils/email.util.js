const nodemailer = require("nodemailer");
const { COMPANY_NAME, SUPPORT_EMAIL } = require("../constants/business.constants"); // adjust path as needed

// =============================
// Transporter Configuration
// =============================
// NOTE: For production, configure with a real email provider like SendGrid, AWS SES, Gmail, or any SMTP service.
// For local/dev testing, you can still use Ethereal.
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for others
    auth: {
        user: process.env.EMAIL_USER, // Your email username from .env
        pass: process.env.EMAIL_PASS // Your email password from .env
    }
});

// =============================
// Generic Send Email Function
// =============================
/**
 * Sends an email using nodemailer transporter.
 * @param {object} options
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject line.
 * @param {string} options.html - HTML body content.
 * @param {string} [options.from] - Optional custom sender email.
 */
const sendEmail = async ({ to, subject, html, from }) => {
    try {
        const info = await transporter.sendMail({
            from: from || `"${COMPANY_NAME}" <${SUPPORT_EMAIL}>`, // Default from constants
            to,
            subject,
            html
        });

        // If using Ethereal (dev mode), log preview link
        if (nodemailer.getTestMessageUrl(info)) {
            console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
        }

        console.log(`✅ Email sent to ${to} | Subject: ${subject}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return { success: false, error };
    }
};

module.exports = sendEmail;



