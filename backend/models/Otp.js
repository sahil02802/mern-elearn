const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // Auto-delete after 5 minutes
    attempts: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
});

// TTL index is provided by `expires` on createdAt above

module.exports = mongoose.model("Otp", otpSchema);
