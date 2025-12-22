const express = require("express");
const routerAuth = express.Router();
const bcrypt = require("bcryptjs");
const jwtAuth = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { sendOtpEmail } = require("../utils/mailer");
const Otp = require("../models/Otp");

// Helpers
const JWT_SECRET = process.env.JWT_SECRET || "secret123";
const DEV_FALLBACK_OTP = "123456";
const REG_OTP_EXP_MINUTES = 5;
const LOGIN_OTP_EXP_MINUTES = 10;
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown
const MAX_OTP_ATTEMPTS = 5;

// simple normalize
function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

// generate numeric OTP
function generateNumericOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ---------------------------
   1) Send OTP (Start Registration)
   Endpoint: POST /api/auth/send-otp
   Body: { email }
   --------------------------- */
routerAuth.post("/send-otp", async (req, res) => {
  try {
    let { email } = req.body;
    email = normalizeEmail(email);
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Do not reveal whether email exists to prevent user enumeration?
    // Your app earlier returned User exists; keep current behavior but normalized.
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "User already exists" });

    // Cooldown: check existing OTP record
    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      const timeDiff = Date.now() - existingOtp.createdAt.getTime();
      if (timeDiff < RESEND_COOLDOWN_MS) {
        return res
          .status(429)
          .json({ error: "Please wait before resending OTP" });
      }
      // remove old OTP so we create a fresh one
      await Otp.deleteOne({ _id: existingOtp._id });
    }

    const otp = process.env.EMAIL_USER
      ? generateNumericOtp()
      : DEV_FALLBACK_OTP;
    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.create({
      email,
      otpHash,
      // createdAt TTL handled by schema
    });

    const sent = await sendOtpEmail(
      email,
      "Verify your account",
      `Your verification code is ${otp}. It expires in ${REG_OTP_EXP_MINUTES} minutes.`,
      `<p>Your verification code is <strong>${otp}</strong>. It expires in ${REG_OTP_EXP_MINUTES} minutes.</p>`
    );

    if (!sent) {
      // cleanup created OTP if send failed (to avoid leaked records)
      await Otp.deleteMany({ email });
      return res
        .status(500)
        .json({ error: "Failed to send OTP. Try again later." });
    }

    return res.json({ msg: "OTP sent successfully", email });
  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Resend registration OTP
   POST /api/auth/resend-otp
   Body: { email }
   --------------------------- */
routerAuth.post("/resend-otp", async (req, res) => {
  try {
    let { email } = req.body;
    email = normalizeEmail(email);
    if (!email) return res.status(400).json({ error: "Email required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: "User already exists" });

    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      const timeDiff = Date.now() - existingOtp.createdAt.getTime();
      if (timeDiff < RESEND_COOLDOWN_MS) {
        return res
          .status(429)
          .json({ error: "Please wait before resending OTP" });
      }
      // Delete previous and send new
      await Otp.deleteOne({ _id: existingOtp._id });
    }

    const otp = process.env.EMAIL_USER
      ? generateNumericOtp()
      : DEV_FALLBACK_OTP;
    const otpHash = await bcrypt.hash(otp, 10);
    await Otp.create({ email, otpHash });

    const sent = await sendOtpEmail(
      email,
      "Your verification code (resend)",
      `Your verification code is ${otp}. It expires in ${REG_OTP_EXP_MINUTES} minutes.`,
      `<p>Your verification code is <strong>${otp}</strong>. It expires in ${REG_OTP_EXP_MINUTES} minutes.</p>`
    );

    if (!sent) {
      await Otp.deleteMany({ email });
      return res.status(500).json({ error: "Failed to send OTP" });
    }

    return res.json({ msg: "OTP resent", email });
  } catch (err) {
    console.error("resend-otp error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Verify registration OTP
   POST /api/auth/verify-otp
   Body: { email, otp }
   Response: verificationToken (short lived)
   --------------------------- */
routerAuth.post("/verify-otp", async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = normalizeEmail(email);
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP required" });

    const otpRecord = await Otp.findOne({ email, used: false });
    if (!otpRecord)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      await otpRecord.save();
      if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return res
          .status(400)
          .json({ error: "Too many failed attempts. OTP invalidated." });
      }
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Valid OTP — mark used and delete record
    otpRecord.used = true;
    await otpRecord.save();
    await Otp.deleteOne({ _id: otpRecord._id });

    // Issue a short-lived verification token for final registration
    const verificationToken = jwtAuth.sign(
      { email, verified: true },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ msg: "OTP verified", verificationToken });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Complete Registration
   POST /api/auth/register
   Body: { name, email, password, verificationToken }
   Returns: token + user data (auto-login)
   --------------------------- */
routerAuth.post("/register", async (req, res) => {
  try {
    const { name, email: rawEmail, password, verificationToken } = req.body;
    const email = normalizeEmail(rawEmail);

    if (!verificationToken) {
      return res.status(400).json({
        error: "Verification token required. Please verify email first.",
      });
    }

    let decoded;
    try {
      decoded = jwtAuth.verify(verificationToken, JWT_SECRET);
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification token" });
    }

    if (decoded.email !== email) {
      return res
        .status(400)
        .json({ error: "Email does not match verification token" });
    }

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "User already exists" });

    // REMOVED HASHING
    // const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password, // Plain text
      role: "user",
      isEmailVerified: true, // verified via OTP
    });

    // Issue JWT token for auto-login
    const token = jwtAuth.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "8h",
    });

    return res.json({
      msg: "Registration successful! Welcome aboard.",
      token,
      autoLogin: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Login (step 1) - password validated, then send login OTP
   POST /api/auth/login
   Body: { email, password, mode }
   Returns: prompt that OTP was sent
   --------------------------- */
routerAuth.post("/login", async (req, res) => {
  try {
    let { email, password, mode = "user" } = req.body;
    // Debug logging (do not log passwords)
    try {
      console.log(
        `[login attempt] email=${String(
          email
        ).toLowerCase()} mode=${mode} authHeaderPresent=${!!req.headers
          .authorization}`
      );
    } catch (e) {
      // ignore logging errors
    }
    email = normalizeEmail(email);
    if (!email || !password)
      return res.status(400).json({ error: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    let isMatch = false;
    if (user.password && user.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
      // Removed auto-upgrade to hash as per user request
    }

    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    if (mode === "admin" && user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Admin access denied for this user" });
    }
    if (mode === "user" && user.role === "admin") {
      return res
        .status(403)
        .json({ error: "Admin accounts cannot sign in via the user portal" });
    }

    if (user.isEmailVerified === false) {
      // direct client to verification flow
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in", email });
    }

    // generate login OTP
    const otp = process.env.EMAIL_USER
      ? generateNumericOtp()
      : DEV_FALLBACK_OTP;
    const otpHash = await bcrypt.hash(otp, 10);

    user.loginOtpHash = otpHash;
    user.loginOtpExpiresAt = new Date(
      Date.now() + LOGIN_OTP_EXP_MINUTES * 60 * 1000
    );
    user.loginOtpAttempts = 0;
    await user.save();

    const sent = await sendOtpEmail(
      user.email,
      "Login verification code",
      `Your login code is ${otp}. It expires in ${LOGIN_OTP_EXP_MINUTES} minutes.`,
      `<p>Your login code is <strong>${otp}</strong>. It expires in ${LOGIN_OTP_EXP_MINUTES} minutes.</p>`
    );

    if (!sent) {
      // cleanup fields if email failed to send
      user.loginOtpHash = undefined;
      user.loginOtpExpiresAt = undefined;
      user.loginOtpAttempts = 0;
      await user.save();
      return res.status(500).json({ error: "Failed to send login code" });
    }

    return res.json({
      msg: "OTP sent to your email. Please verify to complete login.",
      email: user.email,
      mode,
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Resend login OTP
   POST /api/auth/login/resend-otp
   Body: { email }
   --------------------------- */
routerAuth.post("/login/resend-otp", async (req, res) => {
  try {
    let { email } = req.body;
    email = normalizeEmail(email);
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid user" });

    if (!user.loginOtpExpiresAt || !user.loginOtpHash) {
      return res.status(400).json({
        error: "No active login code to resend. Try logging in again.",
      });
    }

    const timeLeft = user.loginOtpExpiresAt.getTime() - Date.now();
    if (
      timeLeft > (LOGIN_OTP_EXP_MINUTES - 9) * 60 * 1000 &&
      timeLeft > RESEND_COOLDOWN_MS
    ) {
      // allow resend only if there is at least small time gap - but keep simple: check created time via expires - (LOGIN_OTP_EXP_MINUTES)
      // Simpler approach: just allow resend but prevent extremely frequent resends
    }

    // generate a new code and overwrite
    const otp = process.env.EMAIL_USER
      ? generateNumericOtp()
      : DEV_FALLBACK_OTP;
    const otpHash = await bcrypt.hash(otp, 10);
    user.loginOtpHash = otpHash;
    user.loginOtpExpiresAt = new Date(
      Date.now() + LOGIN_OTP_EXP_MINUTES * 60 * 1000
    );
    user.loginOtpAttempts = 0;
    await user.save();

    const sent = await sendOtpEmail(
      user.email,
      "Login verification code (resend)",
      `Your login code is ${otp}. It expires in ${LOGIN_OTP_EXP_MINUTES} minutes.`,
      `<p>Your login code is <strong>${otp}</strong>. It expires in ${LOGIN_OTP_EXP_MINUTES} minutes.</p>`
    );

    if (!sent) {
      user.loginOtpHash = undefined;
      user.loginOtpExpiresAt = undefined;
      user.loginOtpAttempts = 0;
      await user.save();
      return res.status(500).json({ error: "Failed to resend login code" });
    }

    return res.json({ msg: "Login OTP resent", email: user.email });
  } catch (err) {
    console.error("login/resend-otp error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Verify login OTP
   POST /api/auth/login/verify-otp
   Body: { email, otp, mode }
   Returns: token + user
   --------------------------- */
routerAuth.post("/login/verify-otp", async (req, res) => {
  try {
    let { email, otp, mode = "user" } = req.body;
    email = normalizeEmail(email);
    if (!email || !otp)
      return res.status(400).json({ error: "Email & OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    if (mode === "admin" && user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Admin access denied for this user" });
    }
    if (mode === "user" && user.role === "admin") {
      return res
        .status(403)
        .json({ error: "Admin accounts cannot sign in via the user portal" });
    }

    if (!user.loginOtpHash || !user.loginOtpExpiresAt)
      return res.status(400).json({ error: "No active login code" });

    if (user.loginOtpExpiresAt < new Date())
      return res.status(400).json({ error: "Login code expired" });

    const ok = await bcrypt.compare(otp, user.loginOtpHash);
    if (!ok) {
      user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;
      await user.save();
      if (user.loginOtpAttempts >= MAX_OTP_ATTEMPTS) {
        // invalidate login OTP
        user.loginOtpHash = undefined;
        user.loginOtpExpiresAt = undefined;
        user.loginOtpAttempts = 0;
        await user.save();
        return res
          .status(400)
          .json({ error: "Too many failed attempts. Login OTP invalidated." });
      }
      return res.status(400).json({ error: "Invalid login code" });
    }

    // success
    user.loginOtpHash = undefined;
    user.loginOtpExpiresAt = undefined;
    user.loginOtpAttempts = 0;
    await user.save();

    const token = jwtAuth.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "8h",
    });

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("login/verify-otp error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Get current user (protected)
   --------------------------- */
routerAuth.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -loginOtpHash"
    );
    res.json(user);
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Update current user (protected)
   --------------------------- */
routerAuth.put("/me", authMiddleware, async (req, res) => {
  try {
    // Allow updating name/avatar as before
    const updates = {};
    if (typeof req.body.name === "string") updates.name = req.body.name;
    if (typeof req.body.avatar === "string") updates.avatar = req.body.avatar;

    // Support password change when user supplies currentPassword + newPassword
    if (
      typeof req.body.currentPassword === "string" ||
      typeof req.body.newPassword === "string"
    ) {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error:
            "Both currentPassword and newPassword are required to change password",
        });
      }

      const userRecord = await User.findById(req.user.id);
      if (!userRecord) return res.status(404).json({ error: "User not found" });

      let isMatch = false;
      if (userRecord.password && userRecord.password.startsWith("$2")) {
        isMatch = await bcrypt.compare(currentPassword, userRecord.password);
      } else {
        isMatch = currentPassword === userRecord.password;
      }

      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });

      // const hashed = await bcrypt.hash(newPassword, 10);
      updates.password = newPassword; // Plain text
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password -loginOtpHash");
    res.json(user);
  } catch (err) {
    console.error("me update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Forgot Password - Send OTP
   POST /api/auth/forgot-password
   Body: { email }
   --------------------------- */
routerAuth.post("/forgot-password", async (req, res) => {
  try {
    let { email } = req.body;
    email = normalizeEmail(email);
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Cooldown check
    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      const timeDiff = Date.now() - existingOtp.createdAt.getTime();
      if (timeDiff < RESEND_COOLDOWN_MS) {
        return res
          .status(429)
          .json({ error: "Please wait before resending OTP" });
      }
      await Otp.deleteOne({ _id: existingOtp._id });
    }

    const otp = process.env.EMAIL_USER
      ? generateNumericOtp()
      : DEV_FALLBACK_OTP;

    // Log OTP for easier testing/debugging as per user preference context
    console.log(`[Forgot Password] OTP for ${email}: ${otp}`);

    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.create({
      email,
      otpHash,
    });

    const sent = await sendOtpEmail(
      email,
      "Reset your password",
      `Your password reset code is ${otp}. It expires in ${REG_OTP_EXP_MINUTES} minutes.`,
      `<p>Your password reset code is <strong>${otp}</strong>. It expires in ${REG_OTP_EXP_MINUTES} minutes.</p>`
    );

    if (!sent) {
      await Otp.deleteMany({ email });
      return res.status(500).json({ error: "Failed to send OTP" });
    }

    return res.json({ msg: "OTP sent to email", email });
  } catch (err) {
    console.error("forgot-password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Verify Forgot Password OTP
   POST /api/auth/verify-reset-otp
   Body: { email, otp }
   Returns: resetToken
   --------------------------- */
routerAuth.post("/verify-reset-otp", async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = normalizeEmail(email);
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP required" });

    const otpRecord = await Otp.findOne({ email, used: false });
    if (!otpRecord)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      await otpRecord.save();
      if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return res
          .status(400)
          .json({ error: "Too many failed attempts. OTP invalidated." });
      }
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Valid
    otpRecord.used = true;
    await otpRecord.save();
    await Otp.deleteOne({ _id: otpRecord._id });

    // Issue reset token
    const resetToken = jwtAuth.sign(
      { email, purpose: "reset_password" },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.json({ msg: "OTP verified", resetToken });
  } catch (err) {
    console.error("verify-reset-otp error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Reset Password
   POST /api/auth/reset-password
   Body: { email, resetToken, newPassword }
   --------------------------- */
routerAuth.post("/reset-password", async (req, res) => {
  try {
    const { email: rawEmail, resetToken, newPassword } = req.body;
    const email = normalizeEmail(rawEmail);

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let decoded;
    try {
      decoded = jwtAuth.verify(resetToken, JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (decoded.email !== email || decoded.purpose !== "reset_password") {
      return res.status(400).json({ error: "Invalid token for this user" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Hash new password - REMOVED
    // const hashed = await bcrypt.hash(newPassword, 10);
    user.password = newPassword; // Plain text
    await user.save();

    return res.json({ msg: "Password reset successful. You can now login." });
  } catch (err) {
    console.error("reset-password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = routerAuth;
