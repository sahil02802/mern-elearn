require("dotenv").config();
const nodemailer = require("nodemailer");

async function debugGmail() {
    console.log("--- Gmail SMTP Debugger ---");
    const user = process.env.EMAIL_USER;
    // Mask password for security in logs
    const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 3) + "..." : "MISSING";

    console.log(`User: ${user}`);
    console.log(`Pass: ${pass}`);

    if (!user || !process.env.EMAIL_PASS) {
        console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        debug: true, // Show detailed SMTP logs
        logger: true  // Log to console
    });

    try {
        console.log("Attempting to verify transporter connection...");
        await transporter.verify();
        console.log("✅ Connection verified successfully!");

        console.log("Attempting to send test email...");
        const info = await transporter.sendMail({
            from: user,
            to: user, // Send to self
            subject: "Gmail SMTP Debug Test",
            text: "If you are reading this, your Gmail App Password is working correctly!"
        });

        console.log("✅ Test email sent!");
        console.log("Message ID:", info.messageId);
    } catch (err) {
        console.error("❌ STMP Error:", err);
        console.log("\n--- Troubleshooting ---");
        if (err.code === 'EAUTH') {
            console.log("1. Check if EMAIL_USER is correct.");
            console.log("2. Check if EMAIL_PASS is a valid 16-character App Password (not your login password).");
            console.log("3. Ensure 2-Step Verification is enabled on your Google Account.");
        }
    }
}

debugGmail();
