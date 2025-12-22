import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, CheckCircle, ArrowRight, RefreshCcw } from "lucide-react";

import API from "../api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function VerifyEmail() {
	const location = useLocation();
	const navigate = useNavigate();
	const initialEmail = location.state?.email || "";
	const initialName = location.state?.name || "";
	const initialPassword = location.state?.password || "";

	const [email, setEmail] = useState(initialEmail);
	const [loading, setLoading] = useState(false);
	const [timeLeft, setTimeLeft] = useState(0);
	const [msg, setMsg] = useState("");
	const [error, setError] = useState("");

	// resend registration OTP
	async function handleResend(e) {
		e.preventDefault();
		setError("");
		setMsg("");

		if (!email) {
			setError("Please enter an email address.");
			return;
		}

		if (timeLeft > 0) return; // cooldown

		setLoading(true);
		try {
			await API.post("/auth/resend-otp", { email: email.trim().toLowerCase() });
			setMsg("New OTP sent successfully.");
			setTimeLeft(60);
			const timer = setInterval(() => {
				setTimeLeft((t) => {
					if (t <= 1) {
						clearInterval(timer);
						return 0;
					}
					return t - 1;
				});
			}, 1000);
		} catch (err) {
			setError(err.response?.data?.error || "Failed to resend OTP.");
		} finally {
			setLoading(false);
		}
	}

	function goToEnterOtp(e) {
		e.preventDefault();
		navigate("/verify-otp", { state: { name: initialName, email, password: initialPassword, source: "register" } });
	}

	return (
		<div className="min-h-screen grid lg:grid-cols-2">
			{/* Visual Side */}
			<div className="hidden lg:flex flex-col justify-center items-center bg-surface relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-canvas/50" />
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8 }}
					className="relative z-10 p-12 text-center max-w-lg"
				>
					<div className="w-24 h-24 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-8 border border-brand-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
						<Mail size={40} className="text-brand-400" />
					</div>
					<h1 className="text-4xl font-display font-bold text-white mb-6">Check your Inbox</h1>
					<p className="text-lg text-ink-400 leading-relaxed">
						We've sent a 6-digit verification code to your email. Enter the code to activate your account and start learning.
					</p>
				</motion.div>
			</div>

			{/* Form Side */}
			<div className="flex flex-col justify-center items-center p-6 sm:p-12 bg-canvas">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="w-full max-w-md space-y-8"
				>
					<div className="text-center lg:hidden">
						<div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
							<Mail size={24} className="text-brand-400" />
						</div>
						<h1 className="text-2xl font-bold text-white">Verify Email</h1>
						<p className="text-ink-400 text-sm mt-2">Enter your email to receive an OTP.</p>
					</div>

					<Card className="p-8 border border-white/5 bg-surface/50 backdrop-blur-md">
						<div className="space-y-6">
							<div>
								<label className="block text-xs font-semibold text-ink-400 mb-1">Email Address</label>
								<Input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									className="bg-surfaceHighlight"
								/>
							</div>

							{msg && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg"
								>
									<CheckCircle size={16} /> {msg}
								</motion.div>
							)}

							{error && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg"
								>
									{error}
								</motion.div>
							)}

							<div className="flex flex-col gap-3">
								<Button
									onClick={handleResend}
									disabled={loading || timeLeft > 0}
									variant="primary"
									className="w-full"
								>
									{loading ? "Sending..." : timeLeft > 0 ? `Resend available in ${timeLeft}s` : "Resend OTP Code"}
									{!loading && timeLeft === 0 && <RefreshCcw size={16} className="ml-2" />}
								</Button>

								<Button
									onClick={goToEnterOtp}
									variant="outline"
									className="w-full"
								>
									Back to Enter Code <ArrowRight size={16} className="ml-2" />
								</Button>
							</div>
						</div>
					</Card>

					<p className="text-center text-sm text-ink-400">
						Need to create an account?{" "}
						<Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
							Register here
						</Link>
					</p>
				</motion.div>
			</div>
		</div>
	);
}
