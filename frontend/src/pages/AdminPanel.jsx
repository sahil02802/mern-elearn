import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import AdminSidebar from "../components/AdminSidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
	LayoutDashboard,
	CreditCard,
	Users,
	BookOpen,
	Terminal,
	Search,
	Edit2,
	Trash2,
	Image as ImageIcon,
	MessageSquare,
	Star,
	X,
	Shield,
	TrendingUp,
	Activity,
	ChevronRight,
	ChevronLeft,
	Menu,
} from "lucide-react";

import API from "../api";
import { authHeader, getCurrentUser, updateStoredUser } from "../auth";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";

const courseTemplate = {
	title: "",
	description: "",
	price: "",
	tech: "",
	imageUrl: "",
};

const userTemplate = {
	name: "",
	email: "",
	password: "",
	role: "user",
};

export default function AdminPanel() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("overview");

	const [courses, setCourses] = useState([]);
	const [courseForm, setCourseForm] = useState(courseTemplate);
	const [editingCourse, setEditingCourse] = useState(null);
	const [courseLoading, setCourseLoading] = useState(true);
	const [imagePreview, setImagePreview] = useState("");
	const [imageFileData, setImageFileData] = useState("");

	const [users, setUsers] = useState([]);
	const [userForm, setUserForm] = useState(userTemplate);
	const [editingUser, setEditingUser] = useState(null);
	const [userLoading, setUserLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const [feedbacks, setFeedbacks] = useState([]);
	const [feedbackLoading, setFeedbackLoading] = useState(false);
	const [viewingFeedback, setViewingFeedback] = useState(null);

	const [purchases, setPurchases] = useState([]);
	const [purchaseLoading, setPurchaseLoading] = useState(false);

	// Pagination States
	const [coursePage, setCoursePage] = useState(1);
	const [userPage, setUserPage] = useState(1);
	const [purchasePage, setPurchasePage] = useState(1);
	const [feedbackPage, setFeedbackPage] = useState(1);

	// Mobile Menu State
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	// Desktop Sidebar Collapse State
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	const COURSES_PER_PAGE = 6;
	const USERS_PER_PAGE = 10;
	const TXNS_PER_PAGE = 10;
	const FEEDBACKS_PER_PAGE = 5;

	// -- Hooks must be unconditional --

	const sessionUser = useMemo(() => getCurrentUser(), []);
	const isAdmin = sessionUser?.role === "admin";

	const totalRevenue = useMemo(() => {
		return purchases
			.filter((p) => p.status === "success")
			.reduce((acc, curr) => acc + (curr.course?.price || 0), 0);
	}, [purchases]);

	// -- Pagination Logic --

	// Courses
	const totalCoursePages = Math.ceil(courses.length / COURSES_PER_PAGE);
	const paginatedCourses = courses.slice(
		(coursePage - 1) * COURSES_PER_PAGE,
		coursePage * COURSES_PER_PAGE
	);

	// Users (Filtered first)
	const filteredUsers = useMemo(() => {
		return users.filter(
			(u) =>
				u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				u.email?.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [users, searchTerm]);

	// Reset user page when search changes
	useEffect(() => {
		setUserPage(1);
	}, [searchTerm]);

	const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
	const paginatedUsers = filteredUsers.slice(
		(userPage - 1) * USERS_PER_PAGE,
		userPage * USERS_PER_PAGE
	);

	// Purchases
	const sortedPurchases = useMemo(() => [...purchases].reverse(), [purchases]);
	const totalPurchasePages = Math.ceil(sortedPurchases.length / TXNS_PER_PAGE);
	const paginatedPurchases = sortedPurchases.slice(
		(purchasePage - 1) * TXNS_PER_PAGE,
		purchasePage * TXNS_PER_PAGE
	);

	// Feedbacks
	const sortedFeedbacks = useMemo(() => {
		return [...feedbacks].sort((a, b) => {
			if (b.rating !== a.rating) return b.rating - a.rating;
			return new Date(b.createdAt) - new Date(a.createdAt);
		});
	}, [feedbacks]);

	const totalFeedbackPages = Math.ceil(
		sortedFeedbacks.length / FEEDBACKS_PER_PAGE
	);
	const paginatedFeedbacks = sortedFeedbacks.slice(
		(feedbackPage - 1) * FEEDBACKS_PER_PAGE,
		feedbackPage * FEEDBACKS_PER_PAGE
	);

	// -- Effects --

	useEffect(() => {
		if (!isAdmin) return;
		loadCourses();
		loadUsers();
		loadPurchases();
		loadFeedbacks();
	}, [isAdmin]);

	async function loadCourses() {
		setCourseLoading(true);
		try {
			const res = await API.get("/courses");
			setCourses(res.data);
		} finally {
			setCourseLoading(false);
		}
	}

	async function loadUsers() {
		setUserLoading(true);
		try {

			const res = await API.get("/users", { headers: authHeader() });
			setUsers(res.data);
		} catch (err) {
			console.error(err);
		} finally {
			setUserLoading(false);
		}
	}

	async function loadPurchases() {
		setPurchaseLoading(true);
		try {
			const res = await API.get("/purchases", { headers: authHeader() });
			setPurchases(res.data);
		} catch (err) {
			console.error(err);
		} finally {
			setPurchaseLoading(false);
		}
	}

	async function loadFeedbacks() {
		setFeedbackLoading(true);
		try {
			const res = await API.get("/feedback");
			setFeedbacks(res.data);
		} catch (err) {
			console.error(err);
		} finally {
			setFeedbackLoading(false);
		}
	}

	// -- Action Handlers --

	function updateCourseField(e) {
		setCourseForm({ ...courseForm, [e.target.name]: e.target.value });
		if (e.target.name === "imageUrl") {
			setImagePreview("");
			setImageFileData("");
		}
	}

	function handleImageFileChange(e) {
		const file = e.target.files && e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onloadend = () => {
			if (typeof reader.result === "string") {
				setImagePreview(reader.result);
				setImageFileData(reader.result);
				setCourseForm((prev) => ({ ...prev, imageUrl: "" }));
			}
		};
		reader.readAsDataURL(file);
	}

	async function saveCourse(e) {
		e.preventDefault();
		if (Number(courseForm.price) < 0) {
			alert("Price cannot be negative");
			return;
		}
		try {
			let imageUrl = courseForm.imageUrl;
			if (imageFileData) {
				const uploadRes = await API.post(
					"/uploads/course-image",
					{ imageData: imageFileData },
					{ headers: authHeader() }
				);
				imageUrl = uploadRes.data.url;
			}
			const payload = {
				...courseForm,
				imageUrl,
				price: Number(courseForm.price || 0),
			};
			if (editingCourse) {
				await API.put(`/courses/${editingCourse}`, payload, {
					headers: authHeader(),
				});
				alert("Course updated successfully");
			} else {
				await API.post("/courses", payload, {
					headers: authHeader(),
				});
				alert("Course created successfully");
			}
			setCourseForm(courseTemplate);
			setImagePreview("");
			setImageFileData("");
			setEditingCourse(null);
			loadCourses();
		} catch (err) {
			alert(err.response?.data?.error || "Course save failed");
		}
	}

	function startEditCourse(course) {
		setCourseForm({
			title: course.title,
			description: course.description,
			price: course.price,
			tech: course.tech,
			imageUrl: course.imageUrl || "",
		});
		setImagePreview("");
		setImageFileData("");
		setEditingCourse(course._id);
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	async function deleteCourse(id) {
		if (!window.confirm("Are you sure you want to delete this course?")) return;
		await API.delete(`/courses/${id}`, { headers: authHeader() });
		if (editingCourse === id) {
			setEditingCourse(null);
			setCourseForm(courseTemplate);
		}
		loadCourses();
	}

	// User Actions
	function updateUserField(e) {
		setUserForm({ ...userForm, [e.target.name]: e.target.value });
	}

	async function saveUser(e) {
		e.preventDefault();
		const payload = { ...userForm };
		if (!payload.password) delete payload.password;

		try {
			let res;
			if (editingUser) {
				res = await API.put(`/users/${editingUser}`, payload, {
					headers: authHeader(),
				});
				alert("User updated");
			} else {
				res = await API.post(`/users`, payload, { headers: authHeader() });
				alert("User created");
			}
			if (res?.data && sessionUser && res.data._id === sessionUser._id) {
				updateStoredUser(res.data);
			}
			setUserForm(userTemplate);
			setEditingUser(null);
			loadUsers();
		} catch (err) {
			alert(err.response?.data?.error || "User save failed");
		}
	}

	function startEditUser(user) {
		setUserForm({
			name: user.name || "",
			email: user.email,
			password: "",
			role: user.role,
		});
		setEditingUser(user._id);
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	async function deleteUser(id) {
		if (!window.confirm("Delete this user?")) return;
		await API.delete(`/users/${id}`, { headers: authHeader() });
		if (editingUser === id) {
			setEditingUser(null);
			setUserForm(userTemplate);
		}
		loadUsers();
	}

	async function deleteFeedback(id) {
		if (!window.confirm("Delete this feedback?")) return;
		try {
			await API.delete(`/feedback/${id}`, { headers: authHeader() });
			loadFeedbacks();
		} catch (err) {
			console.error(err);
		}
	}

	if (!isAdmin) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="p-8 text-center text-red-400">
					<Terminal size={48} className="mx-auto mb-4" />
					<h2 className="text-xl font-bold">Access Denied</h2>
					<p className="mt-2 text-ink-400">
						This area is restricted to administrators.
					</p>
				</Card>
			</div>
		);
	}

	const tabs = [
		{ id: "overview", label: "Overview", icon: LayoutDashboard },
		{ id: "purchases", label: "Transactions", icon: CreditCard },
		{ id: "courses", label: "Courses", icon: BookOpen },
		{ id: "users", label: "Users", icon: Users },
		{ id: "feedback", label: "Feedback", icon: MessageSquare },
		{ id: "lab", label: "System", icon: Terminal },
	];

	return (
		<div className="dashboard-root">
			<AdminSidebar
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				isCollapsed={isSidebarCollapsed}
				setIsCollapsed={setIsSidebarCollapsed}
				isMobileOpen={isMobileMenuOpen}
				setIsMobileOpen={setIsMobileMenuOpen}
				currentUser={sessionUser}
			/>

			{/* Main Content Area */}
			<div className="dashboard-main">
				<div className="dashboard-container">
					<div className="lg:hidden mb-6 flex items-center justify-between">
						<h1 className="text-xl font-bold text-white uppercase tracking-wider">
							{tabs.find((t) => t.id === activeTab)?.label || "Admin"}
						</h1>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsMobileMenuOpen(true)}
						>
							<Menu size={20} className="mr-2" /> Menu
						</Button>
					</div>

					<AnimatePresence mode="wait">
						{activeTab === "overview" && (
							<motion.div
								key="overview"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="space-y-8"
							>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div>
										<h1 className="text-3xl font-display font-bold text-white mb-2">
											Admin Overview
										</h1>
										<p className="text-ink-400">
											Welcome back, {sessionUser?.name}. Key performance
											indicators for today.
										</p>
									</div>
									<div className="flex items-center gap-2 text-xs font-mono text-ink-500 bg-surface/50 px-3 py-1.5 rounded-lg border border-white/5">
										<Activity size={14} />
										<span>Live Updates</span>
									</div>
								</div>

								<div className="dashboard-grid-cards">
									<Card className="relative p-6 bg-surface/50 border border-white/5 overflow-hidden group hover:border-rose-500/30 transition-all">
										<div className="relative z-10 flex justify-between items-start">
											<div>
												<p className="text-ink-400 font-medium mb-1">
													Total Courses
												</p>
												<h2 className="text-4xl font-bold text-white">
													{courses.length}
												</h2>
											</div>
											<div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
												<BookOpen size={24} />
											</div>
										</div>
										<div className="mt-4 flex items-center gap-2 text-sm text-rose-400">
											<TrendingUp size={16} />
											<span>Active Content</span>
										</div>
									</Card>

									<Card className="relative p-6 bg-surface/50 border border-white/5 overflow-hidden group hover:border-green-500/30 transition-all">
										<div className="relative z-10 flex justify-between items-start">
											<div>
												<p className="text-ink-400 font-medium mb-1">
													Total Learners
												</p>
												<h2 className="text-4xl font-bold text-white">
													{users.length}
												</h2>
											</div>
											<div className="p-3 rounded-xl bg-green-500/10 text-green-400">
												<Users size={24} />
											</div>
										</div>
										<div className="mt-4 flex items-center gap-2 text-sm text-green-400">
											<TrendingUp size={16} />
											<span>Growing Community</span>
										</div>
									</Card>

									<Card className="relative p-6 bg-surface/50 border border-white/5 overflow-hidden group hover:border-purple-500/30 transition-all">
										<div className="relative z-10 flex justify-between items-start">
											<div className="min-w-0 flex-1">
												<p className="text-ink-400 font-medium mb-1">
													Total Revenue
												</p>
												<h2
													className="text-3xl lg:text-5xl font-bold text-white whitespace-nowrap leading-tight"
													title={`₹${totalRevenue.toLocaleString()}`}
												>
													₹{totalRevenue.toLocaleString()}
												</h2>
											</div>
											<div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 ml-4 shrink-0">
												<CreditCard size={24} />
											</div>
										</div>
										<div className="mt-4 flex items-center gap-2 text-sm text-purple-400">
											<TrendingUp size={16} />
											<span>Lifetime Earnings</span>
										</div>
										<div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
											<CreditCard size={150} />
										</div>
									</Card>
								</div>

								<div className="dashboard-grid-cards lg:grid-cols-2 xl:grid-cols-2">
									<Card className="p-0 bg-surface/50 border border-white/5 overflow-hidden flex flex-col h-full">
										<div className="flex justify-between items-center p-6 border-b border-white/5">
											<h3 className="font-bold text-white text-lg">
												Recent Enrollments
											</h3>
											<Button
												size="sm"
												variant="ghost"
												onClick={() => setActiveTab("purchases")}
											>
												View All
											</Button>
										</div>
										<div className="p-4 space-y-3">
											{purchases.slice(0, 5).map((p, i) => (
												<div
													key={i}
													className="flex items-center justify-between p-3 rounded-xl bg-surfaceHighlight/20 border border-white/5 hover:bg-surfaceHighlight/30 transition-colors"
												>
													<div className="flex items-center gap-3 min-w-0 flex-1">
														<div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold shrink-0">
															{p.course?.title?.[0] || "C"}
														</div>
														<div className="min-w-0 flex-1">
															<p className="text-sm font-bold text-white truncate">
																{p.course?.title}
															</p>
															<p className="text-xs text-ink-400 truncate">
																{p.user?.name}
															</p>
														</div>
													</div>
													<div className="text-right shrink-0 pl-2">
														<span className="text-green-400 font-mono text-sm font-bold block">
															+₹{p.course?.price}
														</span>
														<span className="text-[10px] text-ink-500">
															{new Date(p.createdAt).toLocaleDateString()}
														</span>
													</div>
												</div>
											))}
											{purchases.length === 0 && (
												<div className="text-center text-ink-400 py-12 flex flex-col items-center">
													<CreditCard size={32} className="mb-2 opacity-20" />
													<p>No transactions yet</p>
												</div>
											)}
										</div>
									</Card>

									<Card className="p-0 bg-surface/50 border border-white/5 overflow-hidden flex flex-col h-full">
										<div className="flex justify-between items-center p-6 border-b border-white/5">
											<h3 className="font-bold text-white text-lg">
												Newest Learners
											</h3>
											<Button
												size="sm"
												variant="ghost"
												onClick={() => setActiveTab("users")}
											>
												View All
											</Button>
										</div>
										<div className="p-4 space-y-3">
											{users.slice(0, 5).map((u, i) => (
												<div
													key={i}
													className="flex items-center justify-between p-3 rounded-xl bg-surfaceHighlight/20 border border-white/5 hover:bg-surfaceHighlight/30 transition-colors"
												>
													<div className="flex items-center gap-3 min-w-0 flex-1">
														<div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-white shrink-0">
															{u.name?.[0]}
														</div>
														<div className="min-w-0 flex-1">
															<p className="text-sm font-bold text-white truncate">
																{u.name}
															</p>
															<p className="text-xs text-ink-400 truncate">
																{u.email}
															</p>
														</div>
													</div>
													<Badge
														variant={
															u.role === "admin" ? "primary" : "neutral"
														}
														className="shrink-0"
													>
														{u.role}
													</Badge>
												</div>
											))}
											{users.length === 0 && (
												<div className="text-center text-ink-400 py-12 flex flex-col items-center">
													<Users size={32} className="mb-2 opacity-20" />
													<p>No users registered</p>
												</div>
											)}
										</div>
									</Card>
								</div>
							</motion.div>
						)}

						{activeTab === "courses" && (
							<motion.div
								key="courses"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start"
							>
								<div className="space-y-6 order-2 xl:order-1 xl:col-span-2">
									<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface/50 p-6 rounded-2xl border border-white/5">
										<div>
											<h2 className="text-2xl font-bold text-white">
												Course Management
											</h2>
											<p className="text-ink-400 text-sm">
												Create, edit and manage your course catalogue.
											</p>
										</div>
										<Badge
											size="lg"
											className="bg-rose-500/20 text-rose-400 border-rose-500/30"
										>
											{courses.length} Active Courses
										</Badge>
									</div>

									<div className="grid md:grid-cols-2 gap-6">
										{courseLoading ? (
											<div className="col-span-full flex flex-col items-center justify-center py-20 text-ink-400">
												<div className="animate-spin mb-4">
													<Activity size={24} />
												</div>
												<p>Loading courses...</p>
											</div>
										) : (
											paginatedCourses.map((course) => (
												<Card
													key={course._id}
													className="group p-0 overflow-hidden bg-surface/50 border border-white/5 hover:border-rose-500/30 transition-all flex flex-col"
												>
													<div className="aspect-video bg-slate-800 relative overflow-hidden">
														{course.imageUrl ? (
															<img
																src={course.imageUrl}
																alt={course.title}
																className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center bg-surfaceHighlight text-ink-600">
																<ImageIcon size={40} opacity={0.5} />
															</div>
														)}
														<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
															<Button
																size="sm"
																onClick={() => startEditCourse(course)}
																className="shadow-lg"
															>
																<Edit2 size={16} className="mr-2" /> Edit
															</Button>
															<Button
																size="sm"
																variant="danger"
																onClick={() => deleteCourse(course._id)}
																className="shadow-lg"
															>
																<Trash2 size={16} />
															</Button>
														</div>
														<div className="absolute top-3 right-3">
															<Badge className="bg-black/50 backdrop-blur-md border-white/10 text-white shadow-sm">
																{course.tech}
															</Badge>
														</div>
													</div>
													<div className="p-5 flex flex-col flex-1">
														<div className="flex justify-between items-start mb-3 gap-2">
															<h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-rose-400 transition-colors">
																{course.title}
															</h3>
															<span className="text-rose-400 font-mono font-bold whitespace-nowrap">
																₹{course.price}
															</span>
														</div>
														<p className="text-sm text-ink-400 line-clamp-2 mb-4 flex-1">
															{course.description}
														</p>
														<div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-ink-500">
															<span>Last updated recently</span>
															<span className="flex items-center gap-1">
																<Users size={12} /> Public
															</span>
														</div>
													</div>
												</Card>
											))
										)}
									</div>

									<Pagination
										currentPage={coursePage}
										totalPages={totalCoursePages}
										onPageChange={setCoursePage}
									/>
								</div>

								<div className="order-1 xl:order-2 xl:col-span-1">
									<div className="lg:sticky lg:top-24 space-y-4">
										<Card className="p-6 border border-white/5 bg-surface/50 backdrop-blur-md shadow-xl">
											<div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
												<h3 className="font-bold text-white flex items-center gap-2">
													{editingCourse ? (
														<Edit2 size={18} className="text-rose-400" />
													) : (
														<BookOpen size={18} className="text-rose-400" />
													)}
													{editingCourse
														? "Update Course"
														: "Create New Course"}
												</h3>
												{editingCourse && (
													<button
														onClick={() => {
															setEditingCourse(null);
															setCourseForm(courseTemplate);
															setImagePreview("");
															setImageFileData("");
														}}
														className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
													>
														Cancel
													</button>
												)}
											</div>

											<form onSubmit={saveCourse} className="space-y-5">
												<div>
													<label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
														Course Title
													</label>
													<Input
														name="title"
														value={courseForm.title}
														onChange={updateCourseField}
														required
														placeholder="e.g. Master React JS"
													/>
												</div>

												<div className="grid grid-cols-2 gap-4">
													<div>
														<label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
															Price (₹)
														</label>
														<Input
															type="number"
															name="price"
															value={courseForm.price}
															onChange={updateCourseField}
															required
															placeholder="999"
														/>
													</div>
													<div>
														<label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
															Tech Stack
														</label>
														<Input
															name="tech"
															value={courseForm.tech}
															onChange={updateCourseField}
															required
															placeholder="React, Node"
														/>
													</div>
												</div>

												<div>
													<label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
														Description
													</label>
													<textarea
														name="description"
														value={courseForm.description}
														onChange={updateCourseField}
														required
														placeholder="Detailed description of what students will learn..."
														className="w-full bg-surface border border-white/10 rounded-xl p-3 text-sm text-white focus:border-rose-500 outline-none min-h-[120px] resize-y placeholder:text-ink-600 transition-colors focus:bg-surfaceHighlight/20"
													/>
												</div>

												<div>
													<label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
														Cover Image
													</label>
													<div className="space-y-3">
														{imagePreview || courseForm.imageUrl ? (
															<div className="relative rounded-xl overflow-hidden h-40 w-full bg-black/20 group border border-white/10">
																<img
																	src={imagePreview || courseForm.imageUrl}
																	alt="Preview"
																	className="w-full h-full object-cover"
																/>
																<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
																	<p className="text-xs font-bold text-white">
																		Click browse to change
																	</p>
																</div>
															</div>
														) : (
															<div className="h-32 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-ink-500 gap-2 bg-surfaceHighlight/5">
																<ImageIcon size={24} />
																<span className="text-xs">
																	No image selected
																</span>
															</div>
														)}

														<div className="flex gap-2">
															<label className="flex-1 cursor-pointer py-2.5 px-4 rounded-xl bg-surfaceHighlight hover:bg-white/10 transition-colors border border-white/5 flex items-center justify-center gap-2 text-sm font-medium text-white">
																<ImageIcon size={16} />
																<span>Browse</span>
																<input
																	type="file"
																	hidden
																	accept="image/*"
																	onChange={handleImageFileChange}
																/>
															</label>
														</div>
														<div className="relative">
															<Input
																placeholder="Or paste Image URL directly"
																name="imageUrl"
																value={courseForm.imageUrl}
																onChange={updateCourseField}
																className="text-xs py-2"
															/>
														</div>
													</div>
												</div>

												<Button
													type="submit"
													className="w-full py-3 text-sm font-bold shadow-lg shadow-rose-500/20"
												>
													{editingCourse ? "Save Changes" : "Create Course"}
												</Button>
											</form>
										</Card>
									</div>
								</div>
							</motion.div>
						)}

						{activeTab === "users" && (
							<motion.div
								key="users"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start"
							>
								<div className="order-2 xl:order-1 xl:col-span-2">
									<div className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
										<div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surfaceHighlight/5">
											<div>
												<h3 className="text-xl font-bold text-white">
													User Management
												</h3>
												<p className="text-sm text-ink-400">
													Total {users.length} registered accounts
												</p>
											</div>
											<div className="relative w-full sm:w-72">
												<Search
													className="absolute left-3 top-2.5 text-ink-400"
													size={18}
												/>
												<Input
													placeholder="Search by name or email..."
													value={searchTerm}
													onChange={(e) => setSearchTerm(e.target.value)}
													className="pl-10 h-10 bg-surface border-white/10 focus:border-rose-500/50"
												/>
											</div>
										</div>
										<div className="table-shell">
											<table className="w-full text-sm text-left">
												<thead className="text-xs text-ink-400 uppercase bg-surfaceHighlight/50 border-b border-white/5">
													<tr>
														<th className="px-6 py-4 font-bold tracking-wider">
															User Details
														</th>
														<th className="px-6 py-4 font-bold tracking-wider">
															Role
														</th>
														<th className="px-6 py-4 text-right font-bold tracking-wider">
															Actions
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-white/5">
													{userLoading || filteredUsers.length === 0 ? (
														<tr>
															<td
																colSpan="3"
																className="p-12 text-center text-ink-400"
															>
																{userLoading
																	? "Loading users..."
																	: "No users found matching your search."}
															</td>
														</tr>
													) : (
														paginatedUsers.map((user) => (
															<tr
																key={user._id}
																className="hover:bg-white/5 transition-colors group"
															>
																<td className="px-6 py-4">
																	<div className="flex items-center gap-3">
																		<div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-white shrink-0">
																			{user.name?.[0] || "?"}
																		</div>
																		<div>
																			<div className="font-bold text-white">
																				{user.name || "Anonymous"}
																			</div>
																			<div className="text-xs text-ink-400">
																				{user.email}
																			</div>
																		</div>
																	</div>
																</td>
																<td className="px-6 py-4">
																	<Badge
																		variant={
																			user.role === "admin"
																				? "primary"
																				: "neutral"
																		}
																		className="shadow-sm"
																	>
																		{user.role}
																	</Badge>
																</td>
																<td className="px-6 py-4 text-right">
																	<div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
																		<button
																			onClick={() => startEditUser(user)}
																			className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
																			title="Edit"
																		>
																			<Edit2 size={16} />
																		</button>
																		<button
																			onClick={() => deleteUser(user._id)}
																			className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
																			title="Delete"
																		>
																			<Trash2 size={16} />
																		</button>
																	</div>
																</td>
															</tr>
														))
													)}
												</tbody>
											</table>
										</div>
										<div className="p-4">
											<Pagination
												currentPage={userPage}
												totalPages={totalUserPages}
												onPageChange={setUserPage}
												className="mt-0 pt-0 border-t-0"
											/>
										</div>
									</div>
								</div>

								<div className="order-1 xl:order-2 xl:col-span-1">
									<div className="lg:sticky lg:top-24">
										<Card className="p-6 border border-white/5 bg-surface/50 backdrop-blur-md shadow-xl">
											<div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
												<h3 className="font-bold text-white flex items-center gap-2">
													{editingUser ? (
														<Edit2 size={18} className="text-rose-400" />
													) : (
														<Users size={18} className="text-rose-400" />
													)}
													{editingUser ? "Edit User" : "Add User"}
												</h3>
												{editingUser && (
													<button
														onClick={() => {
															setEditingUser(null);
															setUserForm(userTemplate);
														}}
														className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
													>
														Cancel
													</button>
												)}
											</div>

											<form onSubmit={saveUser} className="space-y-4">
												<div>
													<label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
														Full Name
													</label>
													<Input
														name="name"
														value={userForm.name}
														onChange={updateUserField}
														placeholder="John Doe"
													/>
												</div>
												<div>
													<label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
														Email Address
													</label>
													<Input
														type="email"
														name="email"
														value={userForm.email}
														onChange={updateUserField}
														required
														placeholder="john@example.com"
													/>
												</div>
												<div>
													<label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
														Password{" "}
														{editingUser && (
															<span className="font-normal text-ink-500 lowercase">
																(optional)
															</span>
														)}
													</label>
													<Input
														type="password"
														name="password"
														value={userForm.password}
														onChange={updateUserField}
														placeholder="••••••••"
													/>
												</div>
												<div>
													<label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
														Role Permissions
													</label>
													<div className="relative">
														<select
															name="role"
															value={userForm.role}
															onChange={updateUserField}
															className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-rose-500 outline-none appearance-none cursor-pointer hover:bg-surfaceHighlight/20 transition-colors"
														>
															<option value="user">
																User (Standard Access)
															</option>
															<option value="admin">
																Administrator (Full Access)
															</option>
														</select>
														<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-400">
															<ChevronRight size={16} className="rotate-90" />
														</div>
													</div>
												</div>

												<Button
													type="submit"
													className="w-full mt-2 py-3 shadow-lg shadow-rose-500/20"
												>
													{editingUser ? "Save Changes" : "Create User"}
												</Button>
											</form>
										</Card>
									</div>
								</div>
							</motion.div>
						)}

						{activeTab === "purchases" && (
							<motion.div
								key="purchases"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<Card className="p-0 border border-white/5 bg-surface/50 overflow-hidden shadow-xl">
									<div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surfaceHighlight/5">
										<div>
											<h3 className="text-xl font-bold text-white">
												Transaction History
											</h3>
											<p className="text-sm text-ink-400">
												Monitor all financial activities
											</p>
										</div>
										<Badge
											size="lg"
											className="bg-purple-500/10 text-purple-400 border-purple-500/20"
										>
											<CreditCard size={14} className="mr-2" />
											{purchases.length} Transactions
										</Badge>
									</div>
									<div className="table-shell">
										<table className="w-full text-sm text-left">
											<thead className="text-xs text-ink-400 uppercase bg-surfaceHighlight/50 border-b border-white/5">
												<tr>
													<th className="px-6 py-4 font-bold tracking-wider">
														User info
													</th>
													<th className="px-6 py-4 font-bold tracking-wider">
														Course
													</th>
													<th className="px-6 py-4 font-bold tracking-wider">
														Amount
													</th>
													<th className="px-6 py-4 font-bold tracking-wider">
														Status
													</th>
													<th className="px-6 py-4 text-right font-bold tracking-wider">
														Date
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-white/5">
												{purchaseLoading ? (
													<tr>
														<td
															colSpan="5"
															className="p-12 text-center text-ink-400"
														>
															Loading transactions...
														</td>
													</tr>
												) : (
													paginatedPurchases.map((p) => (
														<tr
															key={p._id}
															className="hover:bg-white/5 transition-colors group"
														>
															<td className="px-6 py-4">
																<div className="font-bold text-white">
																	{p.user?.name || "Unknown"}
																</div>
																<div className="text-xs text-ink-400">
																	{p.user?.email}
																</div>
															</td>
															<td className="px-6 py-4 text-white font-medium">
																{p.course?.title || (
																	<span className="text-red-400 italic">
																		Deleted Course
																	</span>
																)}
															</td>
															<td className="px-6 py-4 font-mono text-white font-bold">
																₹{p.course?.price || 0}
															</td>
															<td className="px-6 py-4">
																<Badge
																	variant={
																		p.status === "success"
																			? "success"
																			: "warning"
																	}
																	className="shadow-sm"
																>
																	{p.status}
																</Badge>
															</td>
															<td className="px-6 py-4 text-right text-ink-400 font-mono text-xs">
																{new Date(p.createdAt).toLocaleDateString()}
															</td>
														</tr>
													))
												)}
												{purchases.length === 0 && !purchaseLoading && (
													<tr>
														<td
															colSpan="5"
															className="p-12 text-center text-ink-400"
														>
															No transactions found.
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
									<div className="p-4">
										<Pagination
											currentPage={purchasePage}
											totalPages={totalPurchasePages}
											onPageChange={setPurchasePage}
											className="mt-0 pt-0 border-t-0"
										/>
									</div>
								</Card>
							</motion.div>
						)}

						{activeTab === "feedback" && (
							<motion.div
								key="feedback"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="flex flex-col h-[600px] relative glass rounded-2xl border border-white/5 bg-surface/50 overflow-hidden max-w-5xl mx-auto shadow-2xl"
							>
								{/* Header - Fixed */}
								<div className="shrink-0 p-6 border-b border-white/5 flex justify-between items-center bg-surfaceHighlight/10">
									<div>
										<h3 className="text-xl font-bold text-white">
											User Feedback
										</h3>
										<p className="text-sm text-ink-400">
											What your community is saying
										</p>
									</div>
									<div className="px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400 text-xs font-bold font-mono shadow-inner">
										{feedbacks.length} REVIEWS
									</div>
								</div>

								{/* Scrollable Content Area */}
								<div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative">
									{feedbackLoading && (
										<div className="absolute inset-0 flex flex-col items-center justify-center text-ink-400">
											<div className="animate-spin mb-4">
												<Activity size={24} />
											</div>
											<p>Loading feedback...</p>
										</div>
									)}

									{!feedbackLoading && feedbacks.length === 0 && (
										<div className="absolute inset-0 flex flex-col items-center justify-center text-ink-400">
											<MessageSquare
												size={32}
												className="mb-4 opacity-20"
											/>
											<p>No feedback received yet.</p>
										</div>
									)}

									{!feedbackLoading && feedbacks.length > 0 && (
										<div className="space-y-4">
											{paginatedFeedbacks.map((f) => (
												<div
													key={f._id}
													className="group p-5 rounded-xl bg-surfaceHighlight/10 hover:bg-surfaceHighlight/30 border border-white/5 hover:border-white/10 transition-all flex gap-5"
												>
													<div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-accent-500 p-[1px] overflow-hidden shadow-lg">
														{f.user?.avatar ? (
															<img
																src={f.user.avatar}
																alt={f.user.name}
																className="w-full h-full object-cover rounded-full"
															/>
														) : (
															<div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-sm font-bold text-white uppercase">
																{f.user?.name?.[0] || "?"}
															</div>
														)}
													</div>
													<div className="grow">
														<div className="flex justify-between items-start mb-2">
															<div>
																<h4 className="text-sm font-bold text-white">
																	{f.user?.name || "Anonymous User"}
																</h4>
																<p className="text-xs text-ink-400">
																	{f.user?.email || "No email"}
																</p>
															</div>
															<div className="flex flex-col items-end gap-1">
																<div
																	className="flex gap-0.5"
																	title={`${f.rating}/5 Stars`}
																>
																	{[...Array(5)].map((_, i) => (
																		<Star
																			key={i}
																			size={14}
																			className={
																				i < f.rating
																					? "fill-yellow-400 text-yellow-400"
																					: "fill-transparent text-ink-600"
																			}
																		/>
																	))}
																</div>
																<span className="text-[10px] text-ink-500 font-mono">
																	{new Date(
																		f.createdAt
																	).toLocaleDateString()}
																</span>
															</div>
														</div>
														<div className="mt-2 p-4 rounded-xl bg-black/20 text-sm text-ink-200 leading-relaxed border border-white/5 relative">
															<span className="absolute top-2 left-2 text-3xl font-serif text-white/10 leading-none">
																"
															</span>
															<div className="relative z-10 pl-2">
																{f.comment.length > 150 ? (
																	<>
																		<div className="line-clamp-2 md:line-clamp-2 break-all">
																			{f.comment}
																		</div>
																		<button
																			onClick={() => setViewingFeedback(f)}
																			className="text-xs font-bold text-rose-400 mt-2 hover:text-rose-300 hover:underline flex items-center gap-1"
																		>
																			Read More <ChevronRight size={12} />
																		</button>
																	</>
																) : (
																	<div className="break-all">
																		{f.comment}
																	</div>
																)}
															</div>
														</div>
													</div>
													<button
														onClick={() => deleteFeedback(f._id)}
														className="self-start p-2 rounded-lg text-ink-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
														title="Delete Feedback"
													>
														<Trash2 size={16} />
													</button>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Footer - Fixed Pagination */}
								<div className="shrink-0 p-4 border-t border-white/5 bg-surfaceHighlight/5 z-10 flex justify-center items-center gap-4">
									<button
										onClick={() => setFeedbackPage((p) => Math.max(1, p - 1))}
										disabled={feedbackPage === 1}
										className="p-2 rounded-lg text-ink-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
										title="Previous Page"
									>
										<ChevronLeft size={20} />
									</button>

									<div className="text-sm font-mono text-ink-400">
										Page <span className="text-white font-bold">{feedbackPage}</span> of{" "}
										<span className="text-white font-bold">{Math.max(1, totalFeedbackPages)}</span>
									</div>

									<button
										onClick={() => setFeedbackPage((p) => Math.min(totalFeedbackPages, p + 1))}
										disabled={feedbackPage >= totalFeedbackPages}
										className="p-2 rounded-lg text-ink-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
										title="Next Page"
									>
										<ChevronRight size={20} />
									</button>
								</div>
							</motion.div>
						)}

						{activeTab === "lab" && (
							<motion.div
								key="lab"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<Card className="p-8 border border-white/5 bg-surface/50 max-w-2xl mx-auto shadow-2xl">
									<div className="flex items-center gap-4 mb-8 text-rose-400 border-b border-white/5 pb-6">
										<div className="p-3 rounded-xl bg-rose-500/20">
											<Terminal size={32} />
										</div>
										<div>
											<h2 className="text-2xl font-bold text-white">
												System Status
											</h2>
											<p className="text-sm text-ink-400">
												Operational Metrics
											</p>
										</div>
									</div>
									<div className="space-y-4">
										{[
											"Database Connection: Active",
											"Redis Cache: Enabled",
											"Email Service (SendGrid): Operational",
											"Stripe Payments: Test Mode",
											"API Latency: < 50ms",
										].map((item, i) => (
											<div
												key={i}
												className="flex items-center gap-4 p-4 rounded-xl bg-surfaceHighlight/50 border border-white/5"
											>
												<div className="w-2 h-2 rounded-full bg-green-500 shadow-glow-sm shadow-green-500/50" />
												<span className="text-ink-200 font-mono text-sm">
													{item}
												</span>
											</div>
										))}
									</div>
								</Card>
							</motion.div>
						)}
					</AnimatePresence>

					{/* View Feedback Modal */}
					{viewingFeedback &&
						createPortal(
							<div
								className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
								onClick={() => setViewingFeedback(null)}
							>
								<motion.div
									initial={{ scale: 0.95, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									onClick={(e) => e.stopPropagation()}
									className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
								>
									<div className="flex justify-between items-center p-6 border-b border-white/5 bg-surfaceHighlight/20">
										<h3 className="font-bold text-white flex items-center gap-2">
											<MessageSquare size={18} className="text-rose-400" />
											Feedback Details
										</h3>
										<button
											onClick={() => setViewingFeedback(null)}
											className="text-ink-400 hover:text-white transition-colors"
										>
											<X size={20} />
										</button>
									</div>
									<div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
										<div className="flex items-center gap-4 mb-6">
											<div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-accent-500 p-[1px] shrink-0 overflow-hidden shadow-lg">
												{viewingFeedback.user?.avatar ? (
													<img
														src={viewingFeedback.user.avatar}
														alt={viewingFeedback.user.name}
														className="w-full h-full object-cover rounded-full"
													/>
												) : (
													<div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-xl font-bold text-white uppercase">
														{viewingFeedback.user?.name?.[0] || "?"}
													</div>
												)}
											</div>
											<div>
												<h4 className="font-bold text-white text-lg">
													{viewingFeedback.user?.name || "Anonymous User"}
												</h4>
												<p className="text-sm text-ink-400">
													{viewingFeedback.user?.email || "No email"}
												</p>
												<div className="flex text-yellow-500 mt-1 gap-0.5">
													{[...Array(5)].map((_, i) => (
														<Star
															key={i}
															size={14}
															className={
																i < viewingFeedback.rating
																	? "fill-current"
																	: "text-white/20"
															}
														/>
													))}
												</div>
											</div>
										</div>
										<div className="p-6 rounded-xl bg-surfaceHighlight/30 border border-white/5 text-ink-100 leading-relaxed font-sans whitespace-pre-line break-words shadow-inner">
											{viewingFeedback.comment}
										</div>
										<div className="mt-4 text-xs text-ink-500 text-right font-mono">
											Submitted on{" "}
											{new Date(viewingFeedback.createdAt).toLocaleString()}
										</div>
									</div>
								</motion.div>
							</div>,
							document.body
						)}
				</div>
			</div>
		</div >
	);
}
