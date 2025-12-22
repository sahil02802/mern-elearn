import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Key, ShieldCheck, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

import API from "../api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState("EMAIL"); // EMAIL | OTP | PASSWORD
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [msg, setMsg] = useState("");

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMsg("");
        try {
            await API.post("/auth/forgot-password", { email });
            setStep("OTP");
            setMsg("OTP sent to your email.");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await API.post("/auth/verify-reset-otp", { email, otp });
            setResetToken(res.data.resetToken);
            setStep("PASSWORD");
            setMsg("OTP verified. Please set a new password.");
        } catch (err) {
            setError(err.response?.data?.error || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await API.post("/auth/reset-password", {
                email,
                resetToken,
                newPassword: password,
            });
            setMsg("Password reset successful! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to reset password");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-canvas bg-[url('/assets/grid.svg')]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link to="/login" className="inline-flex items-center text-ink-400 hover:text-white mb-6 text-sm transition-colors">
                        <ArrowLeft size={16} className="mr-2" /> Back to Login
                    </Link>
                    <div className="mx-auto w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                        {step === "EMAIL" && <Mail size={24} className="text-indigo-400" />}
                        {step === "OTP" && <ShieldCheck size={24} className="text-indigo-400" />}
                        {step === "PASSWORD" && <Key size={24} className="text-indigo-400" />}
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-ink-400">
                        {step === "EMAIL" && "Enter your email to receive a reset code."}
                        {step === "OTP" && `Enter the code sent to ${email}.`}
                        {step === "PASSWORD" && "Create a secure new password."}
                    </p>
                </div>

                <Card className="p-8 border border-white/5 bg-surface/50 backdrop-blur-md">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2"
                            >
                                <AlertCircle size={16} /> {error}
                            </motion.div>
                        )}
                        {msg && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400 flex items-center gap-2"
                            >
                                <CheckCircle size={16} /> {msg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === "EMAIL" && (
                        <motion.form
                            key="email-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleEmailSubmit}
                            className="space-y-6"
                        >
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-ink-400">
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    autoFocus
                                />
                            </div>
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full"
                            >
                                Send Reset Code
                            </Button>
                        </motion.form>
                    )}

                    {step === "OTP" && (
                        <motion.form
                            key="otp-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleOtpSubmit}
                            className="space-y-6"
                        >
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-ink-400">
                                    Enter 6-Digit OTP
                                </label>
                                <Input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full"
                            >
                                Verify Identity
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep("EMAIL")}
                                className="w-full text-xs text-ink-400 hover:text-white transition-colors"
                            >
                                Change email address
                            </button>
                        </motion.form>
                    )}

                    {step === "PASSWORD" && (
                        <motion.form
                            key="password-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handlePasswordSubmit}
                            className="space-y-6"
                        >
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-ink-400">
                                    New Password
                                </label>
                                <Input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    autoFocus
                                />
                            </div>
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full"
                            >
                                Reset Password
                            </Button>
                        </motion.form>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
