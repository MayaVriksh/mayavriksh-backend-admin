const header = require("../common/header.template");
const footer = require("../common/footer.template");
const styles = require("../common/styles.template");

module.exports = function paymentFailedTemplate({ recipientName, amount, transactionId, dateTime, reason }) {
  return `
  <!doctype html>
  <html>
    <head>
      <title>Payment Failed - MAYAVRIKSH</title>
      ${styles()}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          ${header()}
          <div class="body">
            <h2>Payment Failed</h2>
            <p>Hi ${recipientName},</p>
            <p>We’re sorry, but your payment could not be processed.</p>
            <div class="details">
              <p><strong>Amount:</strong> ₹${amount}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Date & Time:</strong> ${dateTime}</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            <p>Please try again or contact your bank. If the issue persists, write to us at <a href="mailto:support@mayavriksh.com">support@mayavriksh.com</a>.</p>
            <p class="closing">We’re here to help.<br /><strong>Team MAYAVRIKSH</strong></p>
          </div>
          ${footer()}
        </div>
      </div>
    </body>
  </html>
  `;
};
