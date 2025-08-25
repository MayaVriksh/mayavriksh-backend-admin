const sgMail = require("@sendgrid/mail");
const {
    COMPANY_NAME,
    SUPPORT_EMAIL
} = require("../constants/business.constants"); // adjust path as needed
const { AUTH } = require("../constants/emailSubjects.constants");
const welcomeTemplate = require("../email-templates/users/welcome.template");

// =============================
// SendGrid Configuration
// =============================

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// console.log(process.env.SENDGRID_API_KEY);

// =============================
// Generic Send Email Function
// =============================
/**
 * Sends an email using SendGrid.
 * @param {object} options
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject line.
 * @param {string} options.html - HTML body content.
 * @param {string} [options.from] - Optional custom sender email.
 */
const sendEmail = async ({ to, subject, html, from }) => {
    try {
        const msg = {
            to,
            from: "maya.vriksh2025@gmail.com",
            // from: from || `${COMPANY_NAME} <${SUPPORT_EMAIL}>`, // must be a verified sender in SendGrid
            subject,
            html
        };

        const [response] = await sgMail.send(msg);
        console.log("Email response: ", response);

        console.log(`✅ Email sent to ${to} | Subject: ${subject}`);
        return { success: true, status: response.statusCode };
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return { success: false, error };
    }
};

module.exports = sendEmail;

// =============================
// Example usage
// =============================
(async () => {
    await sendEmail({
        to: "j6362254@gmail.com",
        subject: AUTH.ACCOUNT_VERIFIED,
        html: welcomeTemplate("SAKET")
    });
})();
