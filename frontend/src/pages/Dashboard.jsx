import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	BookOpen,
	Settings,
	BarChart2,
	FileText,
	MessageSquare,
	Sparkles,
	LogOut,
	User,
	CreditCard,
	Download,
	Trash2,
	Search,
	CheckCircle,
	AlertCircle,
	Star,
	X,
	Key,
	Shield,
} from "lucide-react";

import API from "../api";
import { authHeader, getCurrentUser, updateStoredUser } from "../auth";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";

// --- Subcomponents ---

function Enrolled() {
	const [enrolled, setEnrolled] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const PER_PAGE = 6;

	useEffect(() => {
		API.get("/purchases/me", { headers: authHeader() })
			.then((r) => setEnrolled(r.data))
			.finally(() => setLoading(false));
	}, []);

	const totalPages = Math.ceil(enrolled.length / PER_PAGE);
	const paginatedEnrolled = enrolled.slice(
		(page - 1) * PER_PAGE,
		page * PER_PAGE
	);

	if (loading)
		return (
			<div className="text-center p-12 text-ink-400">
				Loading your courses...
			</div>
		);

	if (enrolled.length === 0) {
		return (
			<Card className="p-12 text-center bg-surface/50 border border-white/5">
				<div className="inline-flex p-4 rounded-full bg-brand-500/10 text-brand-400 mb-4">
					<BookOpen size={32} />
				</div>
				<h3 className="text-xl font-bold text-white mb-2">
					No active enrollments
				</h3>
				<p className="text-ink-400 mb-6">
					You haven't purchased any courses yet.
				</p>
				<Link to="/courses">
					<Button>Browse Catalog</Button>
				</Link>
			</Card>
		);
	}

	return (
		<div>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{paginatedEnrolled.map((entry) => {
					const course = entry.course;
					if (!course) return null;

					return (
						<motion.div
							key={entry._id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<Card className="h-full flex flex-col p-0 overflow-hidden hover:border-brand-500/30 transition-colors">
								<div className="h-32 bg-slate-800 relative">
									{course.imageUrl && (
										<img
											src={course.imageUrl}
											alt={course.title}
											className="w-full h-full object-cover opacity-60"
										/>
									)}
									<div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
									<div className="absolute top-4 right-4">
										<Badge
											variant={entry.status === "success" ? "success" : "warning"}
										>
											{entry.status}
										</Badge>
									</div>
								</div>

								<div className="p-6 flex flex-col flex-grow -mt-2 relative z-10">
									<h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
										{course.title}
									</h3>
									<p className="text-xs text-ink-400 mb-4">
										Enrolled on {new Date(entry.createdAt).toLocaleDateString()}
									</p>

									<div className="mt-auto">
										{entry.status === "success" ? (
											<Link to={`/courses/${course._id}`}>
												<Button className="w-full" size="sm">
													Continue Learning
												</Button>
											</Link>
										) : (
											<Button
												variant="outline"
												className="w-full"
												size="sm"
												disabled
											>
												Payment Pending
											</Button>
										)}
									</div>
								</div>
							</Card>
						</motion.div>
					);
				})}
			</div>
			<Pagination
				currentPage={page}
				totalPages={totalPages}
				onPageChange={setPage}
			/>
		</div>
	);
}



function ProfilePanel() {
	const [profile, setProfile] = useState(null);
	const [form, setForm] = useState({ name: "", avatar: "" });
	const [message, setMessage] = useState({ type: "", text: "" });
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		API.get("/auth/me", { headers: authHeader() }).then((res) => {
			setProfile(res.data);
			setForm({ name: res.data.name || "", avatar: res.data.avatar || "" });
		});
	}, []);

	function handleAvatarFile(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () =>
			setForm((prev) => ({ ...prev, avatar: reader.result }));
		reader.readAsDataURL(file);
	}

	async function saveProfile(e) {
		e.preventDefault();
		setSaving(true);
		setMessage({ type: "", text: "" });
		try {
			const res = await API.put(
				"/auth/me",
				{ name: form.name, avatar: form.avatar },
				{ headers: authHeader() }
			);
			setProfile(res.data);
			updateStoredUser(res.data);
			setMessage({ type: "success", text: "Profile updated successfully" });
		} catch (err) {
			setMessage({
				type: "error",
				text: err.response?.data?.error || "Update failed",
			});
		} finally {
			setSaving(false);
		}
	}

	if (!profile)
		return (
			<div className="p-12 text-center text-ink-400">Loading profile...</div>
		);

	return (
		<div className="max-w-4xl">
			<Card className="p-8 bg-surface/50 border border-white/5">
				<div className="flex flex-col md:flex-row gap-8 items-start">
					<div className="flex-shrink-0 flex flex-col items-center gap-4">
						<div className="w-32 h-32 rounded-full overflow-hidden bg-surfaceHighlight border-4 border-surface ring-2 ring-white/10 relative">
							{profile.avatar ? (
								<img
									src={profile.avatar}
									alt="Profile"
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-4xl text-brand-400 font-bold">
									{profile.name?.[0] || "U"}
								</div>
							)}
						</div>
						<div className="text-center">
							<h3 className="text-xl font-bold text-white">{profile.name}</h3>
							<p className="text-ink-400 text-sm">{profile.email}</p>
							<Badge variant="neutral" className="mt-2 capitalize">
								{profile.role}
							</Badge>
						</div>
					</div>

					<div className="flex-1 w-full">
						<h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-2">
							Edit Profile
						</h3>
						<form onSubmit={saveProfile} className="space-y-6">
							<div>
								<label className="block text-xs font-semibold text-ink-400 mb-1">
									Display Name
								</label>
								<Input
									name="name"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold text-ink-400 mb-1">
									Avatar Image
								</label>
								<div className="flex items-center gap-4">
									<label className="cursor-pointer bg-surfaceHighlight hover:bg-white/10 text-white text-sm px-4 py-2 rounded-lg transition-colors">
										Upload New
										<input
											type="file"
											hidden
											accept="image/*"
											onChange={handleAvatarFile}
										/>
									</label>
									{form.avatar && (
										<button
											type="button"
											onClick={() => setForm({ ...form, avatar: "" })}
											className="text-red-400 text-sm hover:underline"
										>
											Remove
										</button>
									)}
								</div>
							</div>

							{message.text && (
								<div
									className={`p-3 rounded-lg text-sm ${message.type === "error"
										? "bg-red-500/10 text-red-400"
										: "bg-green-500/10 text-green-400"
										}`}
								>
									{message.text}
								</div>
							)}

							<div className="pt-4 border-t border-white/5">
								<Button type="submit" isLoading={saving}>
									Save Profile Changes
								</Button>
							</div>
						</form>
					</div>
				</div>
			</Card>
		</div>
	);
}

function ChangePasswordPanel() {
	const [profile, setProfile] = useState(null);
	const [passStep, setPassStep] = useState("idle"); // idle, otp, new
	const [passOtp, setPassOtp] = useState("");
	const [passNew, setPassNew] = useState("");
	const [passConfirm, setPassConfirm] = useState("");
	const [resetToken, setResetToken] = useState("");
	const [passLoading, setPassLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		API.get("/auth/me", { headers: authHeader() }).then((res) =>
			setProfile(res.data)
		);
	}, []);

	async function sendPassOtp() {
		setPassLoading(true);
		setMessage({ type: "", text: "" });
		try {
			await API.post("/auth/forgot-password", { email: profile.email });
			setPassStep("otp");
			setMessage({ type: "success", text: "OTP sent to your email." });
		} catch (err) {
			setMessage({
				type: "error",
				text: err.response?.data?.error || "Failed to send OTP",
			});
		} finally {
			setPassLoading(false);
		}
	}

	async function verifyPassOtp() {
		setPassLoading(true);
		setMessage({ type: "", text: "" });
		try {
			const res = await API.post("/auth/verify-reset-otp", {
				email: profile.email,
				otp: passOtp,
			});
			setResetToken(res.data.resetToken);
			setPassStep("new");
			setMessage({
				type: "success",
				text: "OTP verified. Enter new password.",
			});
		} catch (err) {
			setMessage({
				type: "error",
				text: err.response?.data?.error || "Invalid OTP",
			});
		} finally {
			setPassLoading(false);
		}
	}

	async function finalizePassChange() {
		if (passNew !== passConfirm) {
			setMessage({ type: "error", text: "Passwords do not match" });
			return;
		}

		setPassLoading(true);
		setMessage({ type: "", text: "" });
		try {
			await API.post("/auth/reset-password", {
				email: profile.email,
				resetToken,
				newPassword: passNew,
			});
			setPassStep("idle");
			setPassOtp("");
			setPassNew("");
			setPassConfirm("");
			setResetToken("");
			setMessage({ type: "success", text: "Password changed successfully." });
		} catch (err) {
			setMessage({
				type: "error",
				text: err.response?.data?.error || "Failed to change password",
			});
		} finally {
			setPassLoading(false);
		}
	}

	if (!profile)
		return <div className="p-12 text-center text-ink-400">Loading...</div>;

	return (
		<div className="max-w-2xl">
			<Card className="p-8 bg-surface/50 border border-white/5">
				<h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
					<Shield size={24} className="text-brand-400" />
					Security Settings
				</h3>

				<div className="bg-black/20 rounded-xl p-6 border border-white/5">
					<div className="mb-6">
						<h4 className="font-bold text-white mb-1">Change Password</h4>
						<p className="text-sm text-ink-400">
							Protect your account with a strong password. You'll need to verify
							your email via OTP to make changes.
						</p>
					</div>

					{message.text && (
						<div
							className={`mb-6 p-3 rounded-lg text-sm ${message.type === "error"
								? "bg-red-500/10 text-red-400"
								: "bg-green-500/10 text-green-400"
								}`}
						>
							{message.text}
						</div>
					)}

					{passStep === "idle" && (
						<Button onClick={sendPassOtp} isLoading={passLoading}>
							Request OTP to Change Password
						</Button>
					)}

					{passStep === "otp" && (
						<div className="space-y-4 max-w-sm">
							<div>
								<label className="block text-xs font-semibold text-ink-400 mb-1">
									Enter Verification Code
								</label>
								<Input
									value={passOtp}
									onChange={(e) => setPassOtp(e.target.value)}
									placeholder="6-digit OTP"
									className="font-mono tracking-widest text-center text-lg"
									maxLength={6}
								/>
								<p className="text-xs text-ink-500 mt-2">
									Sent to {profile.email}.{" "}
									<button
										onClick={sendPassOtp}
										className="text-brand-400 hover:underline"
									>
										Resend
									</button>
								</p>
							</div>
							<div className="flex gap-3">
								<Button
									onClick={verifyPassOtp}
									isLoading={passLoading}
									className="flex-1"
								>
									Verify
								</Button>
								<Button variant="ghost" onClick={() => setPassStep("idle")}>
									Cancel
								</Button>
							</div>
						</div>
					)}

					{passStep === "new" && (
						<div className="space-y-4 max-w-sm">
							<div>
								<label className="block text-xs font-semibold text-ink-400 mb-1">
									New Password
								</label>
								<Input
									type="password"
									value={passNew}
									onChange={(e) => setPassNew(e.target.value)}
									placeholder="Enter new password"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold text-ink-400 mb-1">
									Confirm Password
								</label>
								<Input
									type="password"
									value={passConfirm}
									onChange={(e) => setPassConfirm(e.target.value)}
									placeholder="Re-enter new password"
								/>
							</div>
							<div className="flex gap-3 pt-2">
								<Button
									onClick={finalizePassChange}
									isLoading={passLoading}
									className="flex-1"
								>
									Update Password
								</Button>
								<Button variant="ghost" onClick={() => setPassStep("idle")}>
									Cancel
								</Button>
							</div>
						</div>
					)}
				</div>
			</Card>
		</div>
	);
}

function AdminInsights() {
	const [stats, setStats] = useState({ courses: [], users: [], purchases: [] });
	const [loading, setLoading] = useState(true);

	const totalRevenue = useMemo(() => {
		return stats.purchases
			.filter((p) => p.status === "success" && p.course?.price)
			.reduce((sum, p) => sum + (p.course.price || 0), 0);
	}, [stats.purchases]);

	useEffect(() => {
		Promise.all([
			API.get("/courses"),
			API.get("/users", { headers: authHeader() }),
			API.get("/purchases", { headers: authHeader() }),
		]).then(([c, u, p]) => {
			setStats({ courses: c.data, users: u.data, purchases: p.data });
			setLoading(false);
		});
	}, []);

	if (loading)
		return (
			<div className="p-12 text-center text-ink-400">Loading analytics...</div>
		);

	const learnerUsers = stats.users.filter((u) => u.role === "user");

	const recentSales = stats.purchases
		.filter((p) => p.status === "success")
		.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		.slice(0, 5);

	return (
		<div className="space-y-8 w-full min-w-0">
			{/* Stat Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
				<Card className="p-4 sm:p-6 bg-indigo-500/10 border-indigo-500/20 min-w-0">
					<div className="flex justify-between items-start gap-3 min-w-0">
						<div className="min-w-0 flex-1">
							<p className="text-xs sm:text-sm font-medium text-indigo-300 truncate">
								Total Courses
							</p>
							<p className="text-2xl sm:text-3xl font-bold text-white mt-1 break-words">
								{stats.courses.length}
							</p>
						</div>
						<div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 flex-shrink-0">
							<BookOpen size={18} className="sm:w-5 sm:h-5" />
						</div>
					</div>
				</Card>

				<Card className="p-4 sm:p-6 bg-emerald-500/10 border-emerald-500/20 min-w-0">
					<div className="flex justify-between items-start gap-3 min-w-0">
						<div className="min-w-0 flex-1">
							<p className="text-xs sm:text-sm font-medium text-emerald-300 truncate">
								Total Learners
							</p>
							<p className="text-2xl sm:text-3xl font-bold text-white mt-1 break-words">
								{learnerUsers.length}
							</p>
						</div>
						<div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 flex-shrink-0">
							<User size={18} className="sm:w-5 sm:h-5" />
						</div>
					</div>
				</Card>

				<Card className="p-4 sm:p-6 bg-purple-500/10 border-purple-500/20 min-w-0 sm:col-span-2 lg:col-span-1">
					<div className="flex justify-between items-start gap-3 min-w-0">
						<div className="min-w-0 flex-1">
							<p className="text-xs sm:text-sm font-medium text-purple-300 truncate">
								Total Revenues
							</p>
							<p className="text-2xl sm:text-3xl font-bold text-white mt-1 break-words">
								₹{totalRevenue.toLocaleString()}
							</p>
						</div>
						<div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 flex-shrink-0">
							<CreditCard size={18} className="sm:w-5 sm:h-5" />
						</div>
					</div>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full min-w-0">
				<Card className="p-4 sm:p-6 bg-surface/50 border border-white/5 min-w-0">
					<h3 className="text-base sm:text-lg font-bold text-white mb-4">
						Recent Enrollments
					</h3>
					<ul className="space-y-3 sm:space-y-4">
						{recentSales.map((sale) => (
							<li
								key={sale._id}
								className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surfaceHighlight/50 min-w-0"
							>
								<div className="flex items-center gap-3 min-w-0 flex-1">
									<div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
										{sale.user?.name?.[0] || "U"}
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-xs sm:text-sm font-medium text-white truncate">
											{sale.course?.title || "Unknown Course"}
										</p>
										<p className="text-xs text-ink-400 truncate">
											{sale.user?.name || "Unknown"}
										</p>
									</div>
								</div>
								<span className="text-xs sm:text-sm font-mono text-green-400 whitespace-nowrap flex-shrink-0">
									+₹{sale.course?.price || 0}
								</span>
							</li>
						))}
						{recentSales.length === 0 && (
							<p className="text-ink-400 text-sm">No recent sales.</p>
						)}
					</ul>
				</Card>

				<Card className="p-4 sm:p-6 bg-surface/50 border border-white/5 min-w-0">
					<h3 className="text-base sm:text-lg font-bold text-white mb-4">
						Newest Learners
					</h3>
					<ul className="space-y-3 sm:space-y-4">
						{learnerUsers
							.slice(-5)
							.reverse()
							.map((u) => (
								<li
									key={u._id}
									className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surfaceHighlight/50 min-w-0"
								>
									<div className="flex items-center gap-3 min-w-0 flex-1">
										<div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
											{u.name?.[0] || "U"}
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-xs sm:text-sm font-medium text-white truncate">
												{u.name || "Anonymous"}
											</p>
											<p className="text-xs text-ink-400 truncate break-all">
												{u.email || "No email"}
											</p>
										</div>
									</div>
									<span className="text-xs text-ink-500 whitespace-nowrap flex-shrink-0">
										{new Date(u.createdAt).toLocaleDateString()}
									</span>
								</li>
							))}
					</ul>
				</Card>
			</div>
		</div>
	);
}

// --- Main Dashboard Component ---

export default function Dashboard() {
	const navigate = useNavigate();
	const location = useLocation();

	// If no sub-route, redirect to enrollments (or whatever default you prefer)
	// Actually, the Routes below handle the sub-paths.
	// But we need to handle the active tab state for styling.

	const [user, setUser] = useState(getCurrentUser());

	function handleLogout() {
		localStorage.removeItem("user");
		// also clear token if stored separately
		window.location.href = "/login";
	}

	// Helper to determine active state
	const isActive = (path) => location.pathname === path;

	const sidebarLinks = [
		{ to: "/dashboard", label: "My Learning", icon: BookOpen, exact: true },
		{ to: "/dashboard/profile", label: "Profile", icon: User },
		{ to: "/dashboard/security", label: "Security", icon: Key },
	].filter(link => {
		if (user?.role === "admin" && link.label === "My Learning") return false;
		return true;
	});

	return (
		<div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
			<div className="grid lg:grid-cols-[18rem,1fr] gap-8">
				{/* Sidebar */}
				<div className="space-y-6">
					<Card className="p-6 bg-surface/50 border border-white/5 sticky top-24">
						{/* Branding Badge */}
						<div className="mb-6 flex items-center gap-3 pb-6 border-b border-white/5">
							<div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
								<Sparkles size={20} />
							</div>
							<div>
								<h2 className="font-bold text-white leading-none">Student Portal</h2>
								<p className="text-xs text-ink-400 uppercase tracking-wider font-bold mt-1">My Learning Hub</p>
							</div>
						</div>
						<div className="flex items-center gap-4 mb-8">
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 p-[1px]">
								<div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-xl font-bold text-white uppercase">
									{user?.name?.[0] || "U"}
								</div>
							</div>
							<div className="overflow-hidden">
								<h2 className="font-bold text-white truncate">
									{user?.name || "User"}
								</h2>
								<p className="text-xs text-ink-400 truncate">{user?.email}</p>
							</div>
						</div>

						<nav className="space-y-2">
							{sidebarLinks.map((link) => (
								<Link
									key={link.to}
									to={link.to}
								>
									<Button
										variant="ghost"
										className={`w-full justify-start ${isActive(link.to)
											? "bg-brand-500/10 text-brand-400"
											: "text-ink-400 hover:text-white"
											}`}
									>
										<link.icon size={18} className="mr-3" />
										{link.label}
									</Button>
								</Link>
							))}

							<div className="pt-4 mt-4 border-t border-white/5">
								<Button
									variant="ghost"
									className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
									onClick={handleLogout}
								>
									<LogOut size={18} className="mr-3" />
									Log Out
								</Button>
							</div>
						</nav>
					</Card>
				</div>

				{/* Content Area */}
				<div className="min-w-0">
					<Routes>
						<Route
							path="/"
							element={user?.role === "admin" ? <Navigate to="profile" replace /> : <Enrolled />}
						/>
						<Route path="profile" element={<ProfilePanel />} />
						<Route path="security" element={<ChangePasswordPanel />} />

						{/* Fallback */}
						<Route path="*" element={<Navigate to="/dashboard" replace />} />
					</Routes>
				</div>
			</div>
		</div>
	);
}


