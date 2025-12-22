const nodemailer = require("nodemailer");

// Create transporter based on environment
const createTransporter = () => {
  const provider = process.env.MAIL_PROVIDER || "mock";

  if (provider === "sendgrid") {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn(
        "⚠️  Missing SENDGRID_API_KEY for sendgrid provider. Using mock emails."
      );
      return null;
    }
    return nodemailer.createTransport({
      service: "SendGrid",
      auth: { user: "apikey", pass: process.env.SENDGRID_API_KEY },
    });
  }

  // Gmail
  if (provider === "gmail") {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn(
        "⚠️  Missing EMAIL_USER or EMAIL_PASS for Gmail. Using mock emails."
      );
      console.warn(
        "   📧 To fix: Set up Gmail App Password at https://myaccount.google.com/apppasswords"
      );
      return null;
    }
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Default to mock
  return null;
};

const transporter = createTransporter();

// Professional HTML Template
const getHtmlTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; }
    .header { background-color: #2563eb; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
    .otp-box { background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
    .otp-code { font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #0f172a; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .warning { font-size: 13px; color: #64748b; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 MERN eLearn</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to verify your account. Please use the following One-Time Password (OTP) to complete your request:</p>
      
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
      </div>

      <p>This code is valid for <strong>5 minutes</strong>.</p>
      <p class="warning">⚠️ If you didn't request this code, you can safely ignore this email. Someone might have typed your email address by mistake.</p>
      <p>Never share this code with anyone. We will never ask for it.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} MERN eLearn. All rights reserved.<br>
      This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>
`;

async function sendOtpEmail(to, subject, text, html) {
  // If using mock mode, just log to console
  if (!transporter || process.env.MAIL_PROVIDER === "mock") {
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║  📧 [MOCK EMAIL - Development Mode]");
    console.log("╠════════════════════════════════════════════════════════╣");
    console.log(`║  To: ${to}`);
    console.log(`║  Subject: ${subject}`);
    const otp =
      text.match(/\b\d{6}\b/)?.[0] ||
      text.split(" ").find((w) => /^\d+$/.test(w));
    console.log(`║  OTP Code: ${otp}`);
    console.log("╚════════════════════════════════════════════════════════╝\n");
    return true;
  }

  try {
    // If html is provided, use it. If not, and it's an OTP email (contains "code"), wrap it in template
    let finalHtml = html;
    if (!finalHtml && text.includes("code")) {
      const otpMatch = text.match(/\b\d{6}\b/);
      if (otpMatch) {
        finalHtml = getHtmlTemplate(otpMatch[0]);
      }
    }

    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || `"MERN eLearn" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // plain text fallback
      html: finalHtml || `<p>${text}</p>`,
    });

    console.log(`✅ Email sent successfully to ${to}`);
    return true;
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
    return false;
  }
}

module.exports = { sendOtpEmail };
