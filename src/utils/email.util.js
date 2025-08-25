const nodemailer = require("nodemailer");

// IMPORTANT: In production, use a real email service like SendGrid, AWS SES, or Gmail.
// For testing, we can use a free service like Ethereal.
// Configure this with your real credentials from .env
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Your email username from .env
        pass: process.env.EMAIL_PASS // Your email password from .env
    }
});

/**
 * A generic function to send an email.
 * @param {object} mailOptions - An object with { to, subject, html }.
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: '"Maya Vriksh" <maya.vriksh2025@gmail.com>',
            to: to, // The recipient's email address
            subject: subject,
            html: html // The HTML body of the email
        });

        console.log(
            "✅ Email sent successfully. Preview URL: %s",
            nodemailer.getTestMessageUrl(info)
        );
        return { success: true };
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return { success: false, error };
    }
};

module.exports = { sendEmail };
