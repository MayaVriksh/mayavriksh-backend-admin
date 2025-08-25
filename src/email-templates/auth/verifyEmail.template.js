const header = require("../common/header.template");
const footer = require("../common/footer.template");
const styles = require("../common/styles.template");

module.exports = function verifyEmailTemplate({ name, email, otp, requestedAt }) {
  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification - MAYAVRIKSH</title>
      ${styles()}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          ${header()}
          <div class="body">
            <h2>Verify Your Email</h2>
            <p>Dear ${name},</p>
            <p>To complete your profile setup with <strong>MAYAVRIKSH</strong>, please confirm your email using the OTP below.</p>
            <div class="otp"><span>${otp}</span></div>
            <p class="small-text">Email: <strong>${email}</strong><br />Requested at: <strong>${requestedAt}</strong></p>
            <p class="small-text">This OTP will remain valid for <strong>10 minutes</strong>.<br />Do not share this OTP with anyone.</p>
            <p class="closing">Sincerely,<br /><strong>Team MAYAVRIKSH</strong></p>
          </div>
          ${footer()}
        </div>
      </div>
    </body>
  </html>
  `;
};
