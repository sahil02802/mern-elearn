# Email OTP Setup Guide

## Problem Fixed

- ✅ **OTP email failure**: Resolved by implementing proper Gmail App Password authentication
- ✅ **Auto-login after registration**: Users are now automatically logged in after successful registration
- ✅ **Better error handling**: Improved logging and error messages for email service debugging

---

## Solution Overview

### 1. OTP Email Issue

**Root Cause**: Gmail blocks regular password authentication for security reasons. You must use an **App Password** instead.

### 2. Auto-Login Feature

After successful registration and OTP verification, users are now:

- Automatically issued a JWT token
- Logged into their account
- Redirected directly to their dashboard
- No need to manually login again

---

## How to Set Up Gmail for OTP

### Step 1: Enable 2-Factor Authentication (Required)

1. Go to https://myaccount.google.com
2. Click **Security** in the left sidebar
3. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select **Mail** for the app
3. Select your device type (e.g., Windows Computer)
4. Google will generate a 16-character password
5. Copy this password (you'll use it in .env)

### Step 3: Update .env File

```dotenv
MAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx    # The 16-char password (spaces included)
EMAIL_FROM="MERN eLearn <your-email@gmail.com>"
```

**Important**: Use the **16-character password**, NOT your regular Gmail password.

### Step 4: Test Email Sending

The backend will now send real OTP emails. Check your email inbox after registration.

---

## Alternative: Use Mock Emails (for Development)

If you don't want to set up Gmail, you can use mock mode to see OTPs in terminal logs:

```dotenv
MAIL_PROVIDER=mock
```

When in mock mode, OTPs will be displayed in the console like this:

```
╔════════════════════════════════════════════════════════╗
║  📧 [MOCK EMAIL - Development Mode]
╠════════════════════════════════════════════════════════╣
║  To: user@example.com
║  Subject: Verify your account
║  OTP Code: 123456
╚════════════════════════════════════════════════════════╝
```

---

## New Registration Flow

### User Registration Process:

1. ✏️ **Enter Details**: Name, Email, Password
2. 📧 **Send OTP**: Click "Register" → OTP sent to email
3. ✅ **Verify OTP**: Enter 6-digit code from email
4. 🎉 **Auto-Login**: Successfully registered & automatically logged in
5. 📊 **Dashboard**: Redirected directly to user dashboard

### What Changed:

- **Old Flow**: Register → Verify OTP → Redirect to Login → Login again
- **New Flow**: Register → Verify OTP → Auto-Login → Dashboard

---

## Code Changes Made

### Backend (`/backend/routes/auth.js`)

- Modified `/api/auth/register` endpoint
- Now returns `{ token, user, autoLogin: true }` after successful registration
- User can access the platform immediately without second login

### Frontend (`/frontend/src/pages/VerifyOtp.jsx`)

- Updated to detect auto-login response
- Saves token to `localStorage`
- Sets authorization header for API requests
- Redirects to `/dashboard` instead of `/login`

### Email Setup (`/backend/utils/mailer.js`)

- Improved error handling and logging
- Better console output showing when emails are sent
- Support for mock mode with clear visual indicators

---

## Troubleshooting

### Issue: "Failed to send OTP. Try again later."

**Solution 1: Check Gmail Credentials**

- Verify you're using App Password, not regular password
- Verify `MAIL_PROVIDER=gmail` in .env
- Check EMAIL_USER matches your Gmail address

**Solution 2: Check 2FA is Enabled**

- Go to https://myaccount.google.com/security
- Confirm 2-Step Verification is ON
- Try regenerating App Password

**Solution 3: Use Mock Mode for Testing**

```dotenv
MAIL_PROVIDER=mock
```

- Restart backend server
- Try registration again
- Check terminal for OTP display

### Issue: "Invalid or expired verification token"

- Make sure to enter OTP within 5 minutes
- OTP is valid for 5 minutes only
- Click "Resend Code" if expired

### Issue: Auto-login not working

- Clear browser `localStorage` and try again
- Check that backend returned `{ token, user, autoLogin: true }`
- Verify token is being saved to localStorage

---

## Testing Auto-Login Feature

1. **Start Backend**:

   ```powershell
   cd backend
   node server.js
   ```

2. **Start Frontend**:

   ```powershell
   cd frontend
   npm run dev
   ```

3. **Register New Account**:

   - Go to `/register`
   - Enter name, email, password
   - Click Register

4. **Verify OTP**:

   - If Mock Mode: Copy OTP from terminal
   - If Gmail: Check email inbox for OTP
   - Enter 6-digit code

5. **Auto-Login**:
   - You should be redirected to `/dashboard`
   - No manual login required!
   - Try refreshing page - you stay logged in

---

## Environment File Reference

| Variable        | Description             | Example                          |
| --------------- | ----------------------- | -------------------------------- |
| `MAIL_PROVIDER` | Email service provider  | `gmail` or `mock`                |
| `EMAIL_USER`    | Gmail address           | `user@gmail.com`                 |
| `EMAIL_PASS`    | App Password (16 chars) | `xxxx xxxx xxxx xxxx`            |
| `EMAIL_FROM`    | Display name in emails  | `"MERN eLearn <user@gmail.com>"` |

---

## Security Notes

- ✅ App Password is safer than main Gmail password
- ✅ App Password only works for Gmail app
- ✅ Passwords are never logged to console (except in mock mode)
- ✅ OTPs are hashed with bcryptjs before storing
- ✅ OTPs expire after 5 minutes
- ✅ Failed OTP attempts are tracked (max 5 attempts)

---

## Support

For issues with:

- **Gmail setup**: Check Gmail Security settings
- **App Password**: Visit https://myaccount.google.com/apppasswords
- **Environment variables**: Copy `.env.example` and fill in your values
- **Auto-login**: Clear localStorage and try fresh registration
