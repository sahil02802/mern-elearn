# Registration & Login Flow Diagrams

## New Registration Flow (with Auto-Login)

```
┌─────────────────────────────────────────────────────────────────┐
│ User Registration Flow                                           │
└─────────────────────────────────────────────────────────────────┘

    User fills form
         │
         ▼
    ┌─────────────┐
    │ /register   │
    └─────────────┘
         │
         ▼
    API: POST /api/auth/send-otp
         │
         ├─── ✅ OTP sent to email ──► 📧 User receives OTP
         │
         ▼
    ┌─────────────┐
    │ /verify-otp │  (User enters 6-digit code)
    └─────────────┘
         │
         ▼
    API: POST /api/auth/verify-otp
         │
         ├─── ✅ OTP verified ──► Returns verificationToken
         │
         ▼
    API: POST /api/auth/register
         │
         ├─── ✅ User created ──┐
         ├─── 🎟️ JWT token generated
         └─── 👤 User data returned
              │
              ▼
         Response: {
            token: "eyJ...",
            user: { id, name, email, role },
            autoLogin: true
         }
              │
              ▼
    Frontend automatically:
         ├─── 💾 Saves token to localStorage
         ├─── 💾 Saves user to localStorage
         ├─── 📍 Sets Authorization header
         └─── 🚀 Redirects to /dashboard
              │
              ▼
         ✨ User now logged in!
         (No manual login needed)
```

---

## Email OTP Flow (Gmail with App Password)

```
┌─────────────────────────────────────────────────────────────────┐
│ Email Sending Flow                                               │
└─────────────────────────────────────────────────────────────────┘

Frontend clicks "Register"
    │
    ▼
POST /api/auth/send-otp
    │
    ▼
Backend:
    ├─ Normalize email
    ├─ Check if user exists (prevent duplicates)
    ├─ Check resend cooldown (1 min between attempts)
    ├─ Generate OTP (6 digits: 123456)
    ├─ Hash OTP with bcrypt
    ├─ Store in OTP collection with TTL (5 min)
    │
    ▼
Send Email via Nodemailer
    │
    ├─── If MAIL_PROVIDER = "gmail"
    │         ├─ Connect to Gmail SMTP
    │         ├─ Authenticate with EMAIL_USER + EMAIL_PASS (App Password)
    │         ├─ Send HTML email template
    │         └─ ✅ Email delivered
    │
    ├─── If MAIL_PROVIDER = "mock"
    │         ├─ Log OTP to console
    │         ├─ Show in terminal for testing
    │         └─ ✅ OTP visible in logs
    │
    ▼
Return Response
    ├─ ✅ "OTP sent successfully" → Frontend redirects to /verify-otp
    └─ ❌ "Failed to send OTP" → Show error message
```

---

## Login Flow (with OTP)

```
┌─────────────────────────────────────────────────────────────────┐
│ User Login Flow (OTP Verification)                              │
└─────────────────────────────────────────────────────────────────┘

    User enters email & password
         │
         ▼
    ┌─────────────┐
    │ /login      │
    └─────────────┘
         │
         ▼
    API: POST /api/auth/login
         │
         ├─ Verify email exists
         ├─ Verify password hash matches
         ├─ Generate login OTP
         ├─ Send OTP to email
         │
         ▼
    ┌─────────────────────┐
    │ /login/verify-otp   │  (User enters OTP from email)
    └─────────────────────┘
         │
         ▼
    API: POST /api/auth/login/verify-otp
         │
         ├─ Verify OTP hash matches
         ├─ Check OTP not expired
         ├─ Check attempts < 5
         │
         ▼
    ✅ Success Response:
         ├─ token: "eyJ..."
         ├─ user: { id, name, email, role }
         │
         ▼
    Frontend saves token + redirects to /dashboard
```

---

## Auto-Login Mechanism

```
┌─────────────────────────────────────────────────────────────────┐
│ Auto-Login Process (After Registration)                         │
└─────────────────────────────────────────────────────────────────┘

Step 1: Register endpoint returns token
    Response.json({
        token: "eyJ...",      ← JWT token
        user: {...},          ← User data
        autoLogin: true       ← Flag to auto-login
    })

Step 2: Frontend detects autoLogin flag
    if (token && autoLogin) {
        // Save credentials
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Set API header
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Redirect
        navigate("/dashboard");
    }

Step 3: User sees dashboard immediately
    ✅ No manual login required!
    ✅ Session persists on refresh (token in localStorage)
    ✅ All API calls include Authorization header

Step 4: On page refresh
    ✅ Token is still in localStorage
    ✅ User stays logged in
    ✅ API requests continue to work
```

---

## Database Schema - OTP Collection

```javascript
// OTP Model (TTL: 5 minutes)
{
    _id: ObjectId,
    email: String,           // Normalized email
    otpHash: String,         // Bcrypted OTP
    used: Boolean,           // Flag if already verified
    attempts: Number,        // Failed OTP attempts (max 5)
    createdAt: Date,         // Auto-expire after 5 min
    updatedAt: Date
}
```

---

## Database Schema - User Collection

```javascript
// User Model
{
    _id: ObjectId,
    name: String,
    email: String,           // Unique
    password: String,        // Bcrypted
    role: "user" | "admin",
    avatar: String,
    isEmailVerified: Boolean,    // Set to true after OTP verification
    emailOtpHash: String,        // Deprecated (using separate OTP collection)
    emailOtpExpiresAt: Date,     // Deprecated
    loginOtpHash: String,        // Current login OTP hash
    loginOtpExpiresAt: Date,     // Current login OTP expiry
    loginOtpAttempts: Number,    // Track failed attempts
    createdAt: Date,
    updatedAt: Date
}
```

---

## Environment Configuration

### Gmail Setup Flow

```
User Gmail Account
    │
    ├─ Enable 2-Step Verification
    │
    ├─ Go to App Passwords: https://myaccount.google.com/apppasswords
    │
    ├─ Select: Mail app
    ├─ Select: Your device (Windows Computer, Mac, etc)
    │
    ├─ ✅ Google generates 16-character password
    │
    └─ Copy to .env:
         EMAIL_PASS=xxxx xxxx xxxx xxxx
```

### .env Setup

```dotenv
# Option A: Real Gmail (with App Password)
MAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx    # 16-char App Password
EMAIL_FROM="MERN eLearn <your-email@gmail.com>"

# Option B: SendGrid (API-based)
MAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx

# Option C: Mock Mode (development/testing)
MAIL_PROVIDER=mock
# OTPs displayed in terminal logs
```

---

## Summary of Changes

### Backend (`auth.js`)

- ✅ `/api/auth/register` now returns JWT token
- ✅ Enables auto-login after successful registration
- ✅ User doesn't need to login manually

### Frontend (`VerifyOtp.jsx`)

- ✅ Detects auto-login response
- ✅ Saves token to localStorage
- ✅ Redirects to /dashboard instead of /login
- ✅ Sets up API Authorization header

### Email Service (`mailer.js`)

- ✅ Better error handling
- ✅ Support for gmail, sendgrid, mock
- ✅ Professional HTML email templates
- ✅ Improved logging for debugging

### Environment Configuration

- ✅ Updated `.env` with Gmail App Password support
- ✅ Created `.env.example` with instructions
- ✅ Support for mock emails in development

---

## Key Improvements

| Aspect             | Before                    | After                           |
| ------------------ | ------------------------- | ------------------------------- |
| Email Auth         | Regular Gmail password ❌ | App Password ✅                 |
| After Registration | Redirect to login         | Auto-login ✅                   |
| User Experience    | 2 steps to access         | 1 step to access ✅             |
| OTP Sending        | Sometimes fails           | Reliable with better logging ✅ |
| Development        | Hard to test              | Mock mode available ✅          |
| Documentation      | Minimal                   | Comprehensive guides ✅         |
