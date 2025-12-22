import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, LayoutDashboard, CreditCard, MessageSquare, Shield, Sparkles } from "lucide-react";
import { clearSession, getCurrentUser, getToken } from "../auth";
import { Button } from "./ui/Button";

const navLinks = [
	{ label: "Home", to: "/" },
	{ label: "Courses", to: "/courses" },
	{ label: "About", to: "/about" },
	{ label: "Contact", to: "/contact" },
];

export default function Nav() {
	const [isMenuOpen, setMenuOpen] = useState(false);
	const navigate = useNavigate();
	const [authState, setAuthState] = useState(() => {
		const initialUser = getCurrentUser();
		return {
			token: getToken(),
			user: initialUser,
			isAdmin: initialUser?.role === "admin",
		};
	});
	const { token, user, isAdmin } = authState;

	useEffect(() => {
		function handleSessionChange() {
			const nextUser = getCurrentUser();
			setAuthState({
				token: getToken(),
				user: nextUser,
				isAdmin: nextUser?.role === "admin",
			});
		}

		window.addEventListener("session:changed", handleSessionChange);
		window.addEventListener("session:user-updated", handleSessionChange);
		return () => {
			window.removeEventListener("session:changed", handleSessionChange);
			window.removeEventListener("session:user-updated", handleSessionChange);
		};
	}, []);

	function logout() {
		clearSession();
		navigate("/");
		setMenuOpen(false);
	}

	return (
		<motion.header
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			className="sticky top-0 z-50 border-b border-white/5 bg-canvas/80 backdrop-blur-xl"
		>
			<div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Logo */}
				<Link to="/" className="flex items-center gap-2 group">
					<div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow group-hover:shadow-glow-hover transition-all duration-300">
						<Sparkles className="h-6 w-6 text-white" />
					</div>
					<span className="text-xl font-display font-bold text-ink-100 tracking-tight">
						Study<span className="text-brand-400">Point</span>
					</span>
				</Link>

				{/* Desktop Nav */}
				<nav className="hidden md:flex items-center gap-1">
					{navLinks.map((link) => (
						<NavLink
							key={link.to}
							to={link.to}
							className={({ isActive }) =>
								`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isActive
									? "text-brand-400 bg-brand-500/10"
									: "text-ink-400 hover:text-ink-100 hover:bg-white/5"
								}`
							}
						>
							{link.label}
						</NavLink>
					))}
				</nav>

				{/* Desktop Actions */}
				<div className="hidden md:flex items-center gap-4">
					{token ? (
						<div className="flex items-center gap-3">
							{isAdmin && (
								<Link to="/admin">
									<Button variant="ghost" size="sm" className="gap-2">
										<Shield size={16} /> Admin
									</Button>
								</Link>
							)}
							{user?.role === "user" && (
								<>
									<Link to="/transactions" title="Transactions">
										<Button variant="ghost" size="sm" className="!px-2.5">
											<CreditCard size={18} />
										</Button>
									</Link>
									<Link to="/feedback" title="Feedback">
										<Button variant="ghost" size="sm" className="!px-2.5">
											<MessageSquare size={18} />
										</Button>
									</Link>
								</>
							)}

							<Link to="/dashboard">
								<Button variant="primary" size="sm" className="gap-2">
									<LayoutDashboard size={16} /> Dashboard
								</Button>
							</Link>

							<Button variant="ghost" size="sm" onClick={logout} className="!px-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10">
								<LogOut size={18} />
							</Button>
						</div>
					) : (
						<div className="flex items-center gap-3">
							<Link to="/login">
								<Button variant="ghost" size="sm">Log In</Button>
							</Link>
							<Link to="/register">
								<Button variant="primary" size="sm" className="shadow-lg shadow-brand-500/20">
									Get Started
								</Button>
							</Link>
						</div>
					)}
				</div>

				{/* Mobile Toggle */}
				<button
					className="md:hidden p-2 text-ink-400 hover:text-ink-100 transition-colors"
					onClick={() => setMenuOpen(!isMenuOpen)}
				>
					{isMenuOpen ? <X /> : <Menu />}
				</button>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="md:hidden border-t border-white/5 bg-canvas/95 backdrop-blur-xl overflow-hidden"
					>
						<div className="p-4 space-y-2">
							{navLinks.map((link) => (
								<NavLink
									key={link.to}
									to={link.to}
									onClick={() => setMenuOpen(false)}
									className={({ isActive }) =>
										`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
											? "bg-brand-500/10 text-brand-400"
											: "text-ink-400 hover:bg-white/5 hover:text-ink-100"
										}`
									}
								>
									{link.label}
								</NavLink>
							))}

							<div className="h-px bg-white/10 my-4" />

							{token ? (
								<div className="space-y-2">
									<div className="px-4 py-2 text-xs font-semibold text-ink-600 uppercase tracking-wider">
										Account
									</div>
									{isAdmin && (
										<Link to="/admin" onClick={() => setMenuOpen(false)}>
											<div className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-400 hover:bg-white/5 hover:text-ink-100 transition-all">
												<Shield size={18} /> Admin Panel
											</div>
										</Link>
									)}
									<Link to="/dashboard" onClick={() => setMenuOpen(false)}>
										<div className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-400 hover:bg-white/5 hover:text-ink-100 transition-all">
											<LayoutDashboard size={18} /> Dashboard
										</div>
									</Link>
									{user?.role === "user" && (
										<>
											<Link to="/transactions" onClick={() => setMenuOpen(false)}>
												<div className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-400 hover:bg-white/5 hover:text-ink-100 transition-all">
													<CreditCard size={18} /> Transactions
												</div>
											</Link>
											<Link to="/feedback" onClick={() => setMenuOpen(false)}>
												<div className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-400 hover:bg-white/5 hover:text-ink-100 transition-all">
													<MessageSquare size={18} /> Feedback
												</div>
											</Link>
										</>
									)}
									<button
										onClick={logout}
										className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
									>
										<LogOut size={18} /> Logout
									</button>
								</div>
							) : (
								<div className="grid grid-cols-2 gap-3 p-2">
									<Link to="/login" onClick={() => setMenuOpen(false)}>
										<Button variant="ghost" className="w-full">Log In</Button>
									</Link>
									<Link to="/register" onClick={() => setMenuOpen(false)}>
										<Button variant="primary" className="w-full">Sign Up</Button>
									</Link>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.header>
	);
}
