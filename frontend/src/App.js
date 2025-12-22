import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseLessons from "./pages/CourseLessons";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Transactions from "./pages/Transactions";
import Feedback from "./pages/Feedback";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import PaymentSuccess from "./pages/PaymentSuccess";
import Categories from "./pages/Categories";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Sitemap from "./pages/Sitemap";
import CookiePolicy from "./pages/CookiePolicy";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { getToken, getCurrentUser } from "./auth";

function RequireAuth({ children }) {
	const token = getToken();
	if (!token) {
		return <Navigate to="/login" replace />;
	}
	return children;
}

function RequireAdmin({ children }) {
	const user = getCurrentUser();
	if (!user || user.role !== "admin") {
		return <Navigate to="/" replace />;
	}
	return children;
}

function App() {
	const [sessionVersion, setSessionVersion] = useState(0);
	const location = useLocation();

	useEffect(() => {
		function handleSessionChange() {
			setSessionVersion((v) => v + 1);
		}

		window.addEventListener("session:changed", handleSessionChange);
		window.addEventListener("session:user-updated", handleSessionChange);
		return () => {
			window.removeEventListener("session:changed", handleSessionChange);
			window.removeEventListener("session:user-updated", handleSessionChange);
		};
	}, []);

	const isAdminRoute = location.pathname.startsWith("/admin");

	return (
		<div className="min-h-screen bg-canvas text-ink-100 flex flex-col overflow-x-hidden w-full selection:bg-brand-500/30 selection:text-brand-200">
			<ScrollToTop />

			{/* Global Ambient Glow */}
			<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/5 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/5 rounded-full blur-[120px]" />
			</div>

			<Nav />

			<main
				className={
					isAdminRoute
						? "relative z-10 w-full flex-1"
						: "relative z-10 mx-auto max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 pb-10 pt-4 w-full min-w-0"
				}
			>
				<AnimatePresence mode="wait">
					<Routes location={location} key={location.pathname}>
						<Route path="/" element={<Home />} />
						<Route path="/courses" element={<Courses />} />
						<Route path="/categories" element={<Categories />} />
						<Route path="/courses/:id" element={<CourseDetail />} />
						<Route path="/courses/:id/lessons" element={<CourseLessons />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/verify-email" element={<VerifyEmail />} />
						<Route path="/verify-otp" element={<VerifyOtp />} />
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route
							path="/dashboard/*"
							element={
								<RequireAuth>
									<Dashboard />
								</RequireAuth>
							}
						/>
						<Route
							path="/admin"
							element={
								<RequireAdmin>
									<AdminPanel />
								</RequireAdmin>
							}
						/>
						<Route path="/about" element={<About />} />
						<Route path="/contact" element={<Contact />} />
						<Route path="/privacy" element={<Privacy />} />
						<Route path="/terms" element={<Terms />} />
						<Route path="/cookies" element={<CookiePolicy />} />
						<Route path="/sitemap" element={<Sitemap />} />
						<Route path="/transactions" element={<Transactions />} />
						<Route
							path="/feedback"
							element={
								<RequireAuth>
									<Feedback />
								</RequireAuth>
							}
						/>
						<Route
							path="/payment/success"
							element={
								<RequireAuth>
									<PaymentSuccess />
								</RequireAuth>
							}
						/>
						<Route path="*" element={<Navigate to="/" />} />
					</Routes>
				</AnimatePresence>
			</main>

			<Footer key={sessionVersion} />
		</div >
	);
}

export default App;
