import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Shield, User, ArrowRight, Lock, Mail } from "lucide-react";
import API from "../api";
import { getToken, setSession } from "../auth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("user");
  const [phase, setPhase] = useState("credentials");
  const [otp, setOtp] = useState("");
  const [emailForOtp, setEmailForOtp] = useState("");
  const [modeForOtp, setModeForOtp] = useState("user");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      if (phase === "credentials") {
        setLoading(true);
        const response = await API.post("/auth/login", {
          email: email.trim().toLowerCase(),
          password,
          mode,
        });

        const { token, user } = response.data || {};
        if (!token || !user) {
          throw new Error("No token returned");
        }

        setSession({ token, user });
        navigate(
          (response.data.mode || mode) === "admin"
            ? "/admin"
            : "/dashboard/profile",
          { replace: true },
        );

        // OTP login flow is temporarily disabled.
        // Keep previous flow for future re-enable:
        // setEmailForOtp(response.data.email || email.trim().toLowerCase());
        // setModeForOtp(response.data.mode || mode);
        // setPhase("otp");
        //
        // // start resend cooldown timer (60s)
        // setResendCooldown(60);
        // const t = setInterval(() => {
        // 	setResendCooldown((s) => {
        // 		if (s <= 1) {
        // 			clearInterval(t);
        // 			return 0;
        // 		}
        // 		return s - 1;
        // 	});
        // }, 1000);
      } else {
        // OTP verification is temporarily disabled.
        // Keep previous flow for future re-enable:
        // setLoading(true);
        // const response = await API.post("/auth/login/verify-otp", {
        // 	email: emailForOtp || email,
        // 	otp,
        // 	mode: modeForOtp || mode,
        // });
        //
        // const { token, user } = response.data;
        // if (!token) throw new Error("No token returned");
        //
        // setSession({ token, user });
        // navigate((modeForOtp || mode) === "admin" ? "/admin" : "/dashboard");
        setError("OTP login is currently disabled.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Login failed. Please try again.";
      setError(msg);

      // special-case: if server tells to verify email first (unverified), redirect to register flow
      if (
        err.response?.status === 403 &&
        msg?.toLowerCase().includes("verify")
      ) {
        // navigate to verify email/register flow (pass email so user can request OTP)
        navigate("/verify-email", {
          state: { email: email.trim().toLowerCase() },
        });
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendLoginOtp() {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/login/resend-otp", { email: emailForOtp || email });
      alert("Login OTP resent!");
      setResendCooldown(60);
      const t = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) {
            clearInterval(t);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">
      {/* Left: Graphic Side */}
      <div className="hidden lg:flex relative bg-surface items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-brand opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-lg space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-400 text-sm font-medium backdrop-blur">
            <Sparkles size={16} className="text-yellow-400" />
            <span>Welcome back!</span>
          </div>

          <h1 className="text-5xl font-display font-bold text-white">
            Continue your <br />
            <span className="text-transparent bg-clip-text bg-gradient-brand">
              Learning Journey.
            </span>
          </h1>

          <p className="text-ink-400 text-lg">
            Access your personalized dashboard, track progress, and unlock new
            skills with our premium courses.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-1">10k+</h3>
              <p className="text-sm text-ink-400">Active Learners</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-1">4.9/5</h3>
              <p className="text-sm text-ink-400">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form Side */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-canvas relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">Sign In</h2>
            <p className="mt-2 text-ink-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-brand-400 hover:text-brand-300 hover:underline"
              >
                Create one for free
              </Link>
            </p>
          </div>

          <Card className="p-0 bg-transparent border-0 shadow-none">
            <form onSubmit={submit} className="space-y-6">
              {phase === "credentials" ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  {/* Mode Switcher */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-surfaceHighlight rounded-xl mb-6">
                    <button
                      type="button"
                      onClick={() => setMode("user")}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        mode === "user"
                          ? "bg-brand-500 text-white shadow-lg"
                          : "text-ink-400 hover:text-white"
                      }`}
                    >
                      <User size={16} /> Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("admin")}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        mode === "admin"
                          ? "bg-brand-500 text-white shadow-lg"
                          : "text-ink-400 hover:text-white"
                      }`}
                    >
                      <Shield size={16} /> Admin
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-3.5 text-ink-400"
                        size={20}
                      />
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-3.5 text-ink-400"
                          size={20}
                        />
                        <Input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                      <div className="text-right">
                        <Link
                          to="/forgot-password"
                          className="text-xs font-semibold text-brand-400 hover:text-brand-300"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-ink-200">
                      We sent a verification code to <br />
                      <span className="font-bold text-white">
                        {emailForOtp || email}
                      </span>
                    </p>
                  </div>

                  <div className="relative">
                    <Shield
                      className="absolute left-3 top-3.5 text-ink-400"
                      size={20}
                    />
                    <Input
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="Enter 6-digit Code"
                      required
                      className="pl-10 text-center text-lg tracking-widest"
                    />
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendLoginOtp}
                      disabled={resendCooldown > 0 || loading}
                      className="text-sm text-brand-400 font-semibold hover:text-brand-300 disabled:opacity-50"
                    >
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Resend Verification Code"}
                    </button>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center"
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
              >
                {phase === "credentials" ? "Sign In" : "Verify & Login"}{" "}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
