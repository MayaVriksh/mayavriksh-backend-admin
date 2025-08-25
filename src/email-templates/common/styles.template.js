module.exports = function stylesTemplate() {
    return `
      <style>
        body { margin:0; padding:0; background:#dbdbdb; font-family:Arial, sans-serif; }
        .wrapper { padding:40px 0; width:100%; }
        .container { width:600px; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); margin:0 auto; }
        .header { background:#013220; padding:20px; }
        .body { padding:32px; color:#333; }
        .body h2 { margin-top:0; font-size:18px; color:#0f4106; }
        .body p { font-size:15px; line-height:1.6; margin:0 0 16px; }
        .otp { margin:24px 0; text-align:center; }
        .otp span { display:inline-block; padding:12px 24px; font-size:20px; font-weight:bold; color:#fff; background:#0f4106; border-radius:6px; letter-spacing:3px; }
        .small-text { font-size:14px; color:#555; line-height:1.6; margin:16px 0; }
        .small-text a { color:#0f4106; text-decoration:none; font-weight:bold; }
        .closing { margin:32px 0 0; font-size:14px; color:#333; }
        .footer { background:#cecaca; padding:14px; text-align:center; font-size:12px; color:#636060; }
        .footer a { color:#0f4106; text-decoration:none; }
      </style>
    `;
  };
  