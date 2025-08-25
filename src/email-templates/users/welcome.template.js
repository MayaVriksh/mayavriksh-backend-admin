const header = require("../common/header.template");
const footer = require("../common/footer.template");
const styles = require("../common/styles.template");

module.exports = function welcomeTemplate({ name }) {
  return `
  <!doctype html>
  <html>
    <head>
      <title>Welcome - MAYAVRIKSH</title>
      ${styles()}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          ${header()}
          <div class="body">
            <h2>Welcome to MAYAVRIKSH!</h2>
            <p>Dear ${name},</p>
            <p>We’re excited to have you on board. Explore our collection and enjoy your journey with us.</p>
            <p class="closing">Warm regards,<br /><strong>Team MAYAVRIKSH</strong></p>
          </div>
          ${footer()}
        </div>
      </div>
    </body>
  </html>
  `;
};
