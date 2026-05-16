const nodemailer = require('nodemailer');
const path = require('path');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'invoshield@gmail.com',
    pass: process.env.SMTP_PASS || 'qsal tpml qfan indc',
  },
});

const sendLoginNotification = async (user) => {
  const recipients = [
    'sumitverse26@gmail.com',
    'sidhantpandey3@gmail.com',
    'tanwarkunalsingh22@gmail.com',
    'divyank843@gmail.com'
  ];

  const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Security Alert: Login Detected</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080b0d; color: #eef2ee; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #0f1417; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.6); }
    .header { background: linear-gradient(135deg, rgba(57,255,140,0.08), rgba(12,158,74,0.08)); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(57,255,140,0.15); }
    .logo { width: 130px; height: auto; max-height: 130px; margin: 0 auto 20px auto; display: block; border-radius: 12px; }
    .title { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #fff; }
    .title span { color: #39ff8c; }
    .content { padding: 40px 30px; }
    .alert-box { background: linear-gradient(90deg, rgba(79,163,255,0.15), rgba(79,163,255,0.05)); border-left: 4px solid #4fa3ff; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px; }
    .alert-title { color: #4fa3ff; font-weight: 700; margin: 0 0 8px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; }
    .alert-desc { margin: 0; color: #a1b0b8; font-size: 14px; line-height: 1.6; }
    .details { background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 25px; margin-bottom: 30px; backdrop-filter: blur(10px); }
    .detail-row { border-bottom: 1px solid rgba(255,255,255,0.05); }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #7a8a80; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; padding: 15px 0; width: 40%; vertical-align: top; }
    .detail-value { color: #fff; font-size: 15px; font-weight: 500; font-family: 'Geist Mono', monospace; text-align: right; padding: 15px 0; width: 60%; vertical-align: top; }
    .recommendation { background: linear-gradient(90deg, rgba(255,79,79,0.15), rgba(255,79,79,0.05)); border-left: 4px solid #ff4f4f; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px; font-size: 13.5px; color: #eef2ee; line-height: 1.6; }
    .recommendation-title { color: #ff4f4f; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { text-align: center; padding: 25px 20px; font-size: 12px; color: #7a8a80; background-color: #080b0d; border-top: 1px solid rgba(255,255,255,0.05); }
    .btn { display: block; background: linear-gradient(135deg, #0c9e4a, #39ff8c); color: #000; text-decoration: none; padding: 16px 24px; border-radius: 8px; font-weight: 800; font-size: 15px; text-align: center; width: 100%; box-sizing: border-box; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 10px 20px rgba(57,255,140,0.2); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="cid:invoshieldLogo" alt="InvoShield Logo" class="logo">
      <h1 class="title">Invo<span>Shield</span></h1>
    </div>
    
    <div class="content">
      <div class="alert-box">
        <div class="alert-title">
          <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          System Authorization Logged
        </div>
        <p class="alert-desc">A successful authentication event was just recorded on the InvoShield Enforcement Dashboard. Please review the session details below.</p>
      </div>
      
      <div class="details">
        <table style="width: 100%; border-collapse: collapse;">
          <tr class="detail-row">
            <td class="detail-label">Officer Name:</td>
            <td class="detail-value">${user.name || 'Sumit Kumar'}</td>
          </tr>
          <tr class="detail-row">
            <td class="detail-label">Official Email:</td>
            <td class="detail-value" style="color: #4fa3ff;">${user.email}</td>
          </tr>
          <tr class="detail-row">
            <td class="detail-label">GSTIN ID:</td>
            <td class="detail-value">${user.gstin || 'GST-AUTH-2026'}</td>
          </tr>
          <tr class="detail-row">
            <td class="detail-label">Timestamp (IST):</td>
            <td class="detail-value">${loginTime}</td>
          </tr>
          <tr class="detail-row">
            <td class="detail-label">IP Address:</td>
            <td class="detail-value">192.168.1.104 (Protected)</td>
          </tr>
          <tr class="detail-row">
            <td class="detail-label">Device Protocol:</td>
            <td class="detail-value">Windows NT 10.0 / Web</td>
          </tr>
        </table>
      </div>

      <div class="recommendation">
        <div class="recommendation-title">Security Protocol</div>
        If you initiated this login, no further action is required. If this access was unauthorized, please escalate immediately to the IT security team. Unauthorized access is strictly monitored.
      </div>
      
      <a href="http://localhost:3000/dashboard" class="btn">View Dashboard Activity</a>
    </div>
    
    <div class="footer">
      <p>This is an automated security notification from the InvoShield Identity Management System.</p>
      <p>&copy; 2026 InvoShield GST Fraud Detection. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: '"InvoShield" <invoshield@gmail.com>',
    to: recipients.join(', '),
    subject: 'Security Alert: InvoShield Login Detected',
    html: htmlTemplate,
    attachments: [
      {
        filename: 'invoshield.png',
        path: path.join(__dirname, '../assets/invoshield.png'),
        cid: 'invoshieldLogo'
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Login notification email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send login notification email:', error.message);
    return false;
  }
};

module.exports = {
  sendLoginNotification,
};
