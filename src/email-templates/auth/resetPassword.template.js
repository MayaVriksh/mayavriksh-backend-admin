const header = require("../common/header.template");
const footer = require("../common/footer.template");
const styles = require("../common/styles.template");

module.exports = function resetPasswordTemplate({ name, resetLink }) {
  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Reset Password - MAYAVRIKSH</title>
      ${styles()}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          ${header()}
          <div class="body">
            <h2>Reset Your Password</h2>
            <p>Hello ${name},</p>
            <p>You requested to reset your password. Click the button below to set a new one:</p>
            <p style="text-align:center;">
              <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#0f4106;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
            </p>
            <p class="small-text">If you did not request this, please ignore this email.</p>
            <p class="closing">Best regards,<br /><strong>Team MAYAVRIKSH</strong></p>
          </div>
          ${footer()}
        </div>
      </div>
    </body>
  </html>
  `;
};
