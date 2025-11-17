import { NextResponse } from "next/server";
import mongoose from "mongoose";
import nodemailer from 'nodemailer';

// Newsletter subscriber model
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);

// Function to send email notification
async function sendEmailNotification(subscriberEmail: string) {
  try {
    // Using nodemailer with Outlook/Hotmail SMTP
    
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER || 'team.newshub@outlook.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email to admin
    await transporter.sendMail({
      from: '"NewsHub Notifications" <team.newshub@outlook.com>',
      to: 'team.newshub@outlook.com',
      subject: '🔔 New Newsletter Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #2563eb;">New Newsletter Subscription</h2>
            <p style="font-size: 16px; color: #333;">A new user has subscribed to your newsletter:</p>
            <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e40af;">${subscriberEmail}</p>
            </div>
            <p style="font-size: 14px; color: #666;">
              <strong>Time:</strong> ${new Date().toLocaleString()}<br>
            </p>
          </div>
        </div>
      `
    });

    // Confirmation email to subscriber
    await transporter.sendMail({
      from: '"NewsHub" <team.newshub@outlook.com>',
      to: subscriberEmail,
      subject: 'Welcome to NewsHub Newsletter! 📰',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #2563eb;">Welcome to NewsHub!</h2>
            <p style="font-size: 16px; color: #333;">Thank you for subscribing to our newsletter.</p>
            <p style="font-size: 16px; color: #333;">You'll receive the latest news and updates directly in your inbox.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Visit NewsHub
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              If you wish to unsubscribe, please contact us at team.newshub@outlook.com
            </p>
          </div>
        </div>
      `
    });

    console.log('✅ Email notifications sent successfully');
  } catch (error) {
    console.error('❌ Error sending email notification:', error);
    // Don't throw error - subscription should still work even if email fails
  }
}

// You would create a Newsletter/Subscriber model for this
// For now, we'll just return a success response
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || "");
    }
    
    // Save subscriber to database
    try {
      await Subscriber.create({ email, subscribedAt: new Date() });
    } catch (dbError: any) {
      if (dbError.code === 11000) {
        // Duplicate email
        return NextResponse.json({
          success: false,
          error: "Email already subscribed"
        }, { status: 400 });
      }
      throw dbError;
    }

    console.log(`📧 New newsletter subscription: ${email}`);

    // Send email notification (async, don't wait for it)
    sendEmailNotification(email).catch(err => 
      console.error('Failed to send notification email:', err)
    );

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter!",
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
