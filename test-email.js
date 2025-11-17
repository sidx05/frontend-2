// Test Email Configuration
// Run this with: node test-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🔍 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📧 Email User:', process.env.EMAIL_USER || '❌ NOT SET');
  console.log('🔑 Email Password:', process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET');
  console.log('🌐 Base URL:', process.env.NEXT_PUBLIC_BASE_URL || '❌ NOT SET');
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ ERROR: Email credentials are not set in .env file');
    console.log('\n📝 To fix this:');
    console.log('1. Open .env file');
    console.log('2. Set EMAIL_USER=team.newshub@outlook.com');
    console.log('3. Set EMAIL_PASSWORD=your-outlook-app-password');
    console.log('4. Run SETUP_EMAIL.bat for detailed instructions');
    process.exit(1);
  }
  
  try {
    console.log('📨 Creating email transporter...');
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    console.log('✅ Transporter created');
    
    console.log('🔗 Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!');
    
    console.log('\n📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"NewsHub Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ Email Configuration Test - SUCCESS',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">Email Configuration Successful!</h2>
          <p>Your NewsHub newsletter email system is working correctly.</p>
          <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="color: #666; font-size: 14px;">
            You will receive notifications when users subscribe to your newsletter.
          </p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('\n🎉 SUCCESS! Check your inbox at:', process.env.EMAIL_USER);
    console.log('\n✨ Your newsletter subscription system is ready to use!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n🔧 Troubleshooting:');
    
    if (error.message.includes('Authentication') || error.message.includes('535')) {
      console.log('• Wrong password - Use APP PASSWORD, not regular password');
      console.log('• Generate app password at: https://account.microsoft.com/security');
    } else if (error.message.includes('ECONNECTION') || error.message.includes('timeout')) {
      console.log('• Network/firewall blocking SMTP');
      console.log('• Check if port 587 is open');
    } else {
      console.log('• Check EMAIL_SETUP.md for detailed troubleshooting');
    }
  }
}

testEmail();
