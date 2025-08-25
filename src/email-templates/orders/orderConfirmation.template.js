const header = require("../common/header.template");
const footer = require("../common/footer.template");
const styles = require("../common/styles.template");

module.exports = function orderConfirmationTemplate({ name, orderId, items, total }) {
  const itemsList = items.map(i => `<li>${i.name} x ${i.qty} - ₹${i.price}</li>`).join("");
  return `
  <!doctype html>
  <html>
    <head>
      <title>Order Confirmation - MAYAVRIKSH</title>
      ${styles()}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          ${header()}
          <div class="body">
            <h2>Order Confirmed!</h2>
            <p>Hi ${name},</p>
            <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
            <ul>${itemsList}</ul>
            <p><strong>Total: ₹${total}</strong></p>
            <p class="closing">Thank you for shopping with us!<br /><strong>Team MAYAVRIKSH</strong></p>
          </div>
          ${footer()}
        </div>
      </div>
    </body>
  </html>
  `;
};
