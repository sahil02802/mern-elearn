// test-email.js (run locally)
require('dotenv').config();
const nodemailer = require('nodemailer');

async function run() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // send to yourself for test
            subject: 'Test email from MERN eLearn',
            text: 'If you see this, mailer works.',
        });
        console.log('Email sent:', info.response || info);
    } catch (err) {
        console.error('Send failed:', err);
    }
}
run();
