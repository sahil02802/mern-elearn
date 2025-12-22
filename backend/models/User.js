const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		name: { type: String, default: "" },
		email: { type: String, unique: true, required: true },
		password: { type: String, required: true },
		role: { type: String, enum: ["user", "admin"], default: "user" },
		avatar: { type: String, default: "" },
		isEmailVerified: { type: Boolean, default: false },
		emailOtpHash: { type: String },
		emailOtpExpiresAt: { type: Date },
		loginOtpHash: { type: String },
		loginOtpExpiresAt: { type: Date },
		loginOtpAttempts: { type: Number, default: 0 }, // track login OTP attempts
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
