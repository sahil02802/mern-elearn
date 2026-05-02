import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import API from "../api";
import { setSession } from "../auth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // OTP registration flow is temporarily disabled.
      // Keep previous flow for future re-enable:
      // await API.post("/auth/send-otp", { email: form.email.trim().toLowerCase() });
      // navigate("/verify-otp", { state: { ...form, source: "register" } });

      const response = await API.post("/auth/register", {
        name: form.name,
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const { token, user } = response.data || {};
      if (token && user) {
        setSession({ token, user });
        navigate("/dashboard");
        return;
      }

      setError("Registration succeeded but session data was missing.");
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
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
            <span>Join the Community</span>
          </div>

          <h1 className="text-5xl font-display font-bold text-white">
            Unlock your <br />
            <span className="text-transparent bg-clip-text bg-gradient-brand">
              Potential Today.
            </span>
          </h1>

          <p className="text-ink-400 text-lg">
            Create an account to access premium courses, track your
            certifications, and connect with global mentors.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold">Lifetime Access</h4>
                <p className="text-sm text-ink-400">
                  Learn at your own pace, forever.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-brand-400">
                <User size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold">Expert Mentors</h4>
                <p className="text-sm text-ink-400">
                  Get guidance from industry leaders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form Side */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-canvas relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="mt-2 text-ink-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-400 hover:text-brand-300 hover:underline"
              >
                Sign in instead
              </Link>
            </p>
          </div>

          <Card className="p-0 bg-transparent border-0 shadow-none">
            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <User
                    className="absolute left-3 top-3.5 text-ink-400"
                    size={20}
                  />
                  <Input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="Full Name"
                    required
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3.5 text-ink-400"
                    size={20}
                  />
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="Email Address"
                    required
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3.5 text-ink-400"
                    size={20}
                  />
                  <Input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={updateField}
                    placeholder="Password (min 6 chars)"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

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
                Continue <ArrowRight size={18} className="ml-2" />
              </Button>

              <p className="text-xs text-center text-ink-400">
                By registering, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
