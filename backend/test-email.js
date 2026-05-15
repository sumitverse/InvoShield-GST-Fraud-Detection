require('dotenv').config();
const { sendLoginNotification } = require('./utils/emailService');

(async () => {
  const user = {
    name: 'Sumit Kumar',
    email: 'officer@gst.gov.in',
    gstin: '27AABC1234D1Z5'
  };
  
  console.log('Sending test email...');
  const success = await sendLoginNotification(user);
  if (success) {
    console.log('Test email sent successfully!');
  } else {
    console.log('Failed to send test email.');
  }
})();
