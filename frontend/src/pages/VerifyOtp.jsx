import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, RefreshCw, Mail } from "lucide-react";
import API from "../api";
import { setSession } from "../auth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // cooldown for resend
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data passed from Register page
  const { name, email, password, source } = location.state || {};

  useEffect(() => {
    // if no registration data, redirect back
    if (!email || !password) {
      navigate("/register");
    }

    // start cooldown only when arrived after send-otp
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [email, password, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Verify OTP -> returns verificationToken
      const verifyRes = await API.post("/auth/verify-otp", { email, otp });
      const verificationToken = verifyRes.data.verificationToken;

      if (!verificationToken) {
        throw new Error("Verification failed. No token returned.");
      }

      // 2. Complete Registration with Token
      const registerRes = await API.post("/auth/register", {
        name,
        email,
        password,
        verificationToken,
      });

      if (registerRes.status !== 200 && registerRes.status !== 201) {
        throw new Error(registerRes.data?.error || "Registration failed.");
      }

      // 3. Auto-login: Save token and user data
      const { token, user, autoLogin } = registerRes.data;

      if (token && autoLogin) {
        // Save to localStorage and notify app
        setSession({ token, user });
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Show success message and redirect to dashboard
        setError(""); // clear any errors
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
      } else {
        // Fallback to login if auto-login not available
        navigate("/login", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/resend-otp", { email });
      if (res.status !== 200)
        throw new Error(res.data?.error || "Failed to resend OTP");
      alert("OTP resent! Check your inbox.");
      setTimeLeft(60);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Failed to resend OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-8 backdrop-blur-xl bg-surface/80 border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-full bg-brand-500/20 text-brand-400 mb-4">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-ink-400">
              We've sent a 6-digit code to <br />
              <span className="font-semibold text-white">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000 000"
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                required
                autoFocus
              />

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timeLeft > 0 || loading}
                  className="flex items-center gap-2 text-sm text-brand-400 font-medium hover:text-brand-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw size={14} className={loading && timeLeft === 0 ? "animate-spin" : ""} />
                  {timeLeft > 0 ? `Resend code in ${timeLeft}s` : "Resend Code"}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm textual-center"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
              disabled={otp.length !== 6}
            >
              Verify Account <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-ink-400">Entered wrong email? </span>
            <button onClick={() => navigate("/register")} className="text-white hover:underline font-medium">
              Change Email
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
