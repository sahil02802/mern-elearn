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
  Plus,
  Eye,
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

const lessonTemplate = {
  title: "",
  description: "",
  order: "",
  videoUrl: "",
  durationSeconds: "",
  pdfUrl: "",
};

function AdminProfileEditor({ sessionUser }) {
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
        { headers: authHeader() },
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
      <motion.div
        key="profile"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="p-12 text-center text-ink-400"
      >
        Loading profile...
      </motion.div>
    );

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Edit Profile
        </h1>
        <p className="text-ink-400">Manage your admin account information.</p>
      </div>

      <Card className="p-8 bg-surface/50 border border-white/5">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-brand-500 to-purple-500 border-4 border-surface ring-2 ring-white/10 relative p-[1px]">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/avatar-placeholder.svg"
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
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
              Account Details
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
                  className={`p-3 rounded-lg text-sm ${
                    message.type === "error"
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
    </motion.div>
  );
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState(courseTemplate);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFileData, setImageFileData] = useState("");
  const [lessonSummaries, setLessonSummaries] = useState({});
  const [selectedCourseForLessons, setSelectedCourseForLessons] =
    useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [courseLessonsLoading, setCourseLessonsLoading] = useState(false);
  const [lessonForm, setLessonForm] = useState(lessonTemplate);
  const [lessonPdfFile, setLessonPdfFile] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(userTemplate);
  const [editingUser, setEditingUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const [viewingLesson, setViewingLesson] = useState(null);

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
    coursePage * COURSES_PER_PAGE,
  );

  // Users (Filtered first)
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  // Reset user page when search changes
  useEffect(() => {
    setUserPage(1);
  }, [searchTerm]);

  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * USERS_PER_PAGE,
    userPage * USERS_PER_PAGE,
  );

  // Purchases
  const sortedPurchases = useMemo(() => [...purchases].reverse(), [purchases]);
  const totalPurchasePages = Math.ceil(sortedPurchases.length / TXNS_PER_PAGE);
  const paginatedPurchases = sortedPurchases.slice(
    (purchasePage - 1) * TXNS_PER_PAGE,
    purchasePage * TXNS_PER_PAGE,
  );

  // Feedbacks
  const sortedFeedbacks = useMemo(() => {
    return [...feedbacks].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [feedbacks]);

  const totalFeedbackPages = Math.ceil(
    sortedFeedbacks.length / FEEDBACKS_PER_PAGE,
  );
  const paginatedFeedbacks = sortedFeedbacks.slice(
    (feedbackPage - 1) * FEEDBACKS_PER_PAGE,
    feedbackPage * FEEDBACKS_PER_PAGE,
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
      const courseData = res.data || [];
      setCourses(courseData);
      await loadLessonSummaries(courseData);
    } finally {
      setCourseLoading(false);
    }
  }

  async function loadLessonSummaries(sourceCourses = []) {
    if (!sourceCourses.length) {
      setLessonSummaries({});
      return;
    }
    try {
      const entries = await Promise.all(
        sourceCourses.map(async (course) => {
          const res = await API.get(`/courses/${course._id}/lessons`);
          const lessons = res.data || [];
          const totalDurationSeconds = lessons.reduce(
            (sum, lesson) => sum + (lesson.durationSeconds || 0),
            0,
          );
          return [
            course._id,
            {
              count: lessons.length,
              totalDurationSeconds,
              highestOrder: lessons.reduce(
                (max, lesson) => Math.max(max, lesson.order || 0),
                0,
              ),
            },
          ];
        }),
      );
      setLessonSummaries(Object.fromEntries(entries));
    } catch (err) {
      console.error(err);
    }
  }

  function formatLessonDuration(totalSeconds) {
    if (!totalSeconds) return "0m";
    const totalMinutes = Math.round(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours && minutes) return `${hours}h ${minutes}m`;
    if (hours) return `${hours}h`;
    return `${minutes}m`;
  }

  async function showCourseLessons(course) {
    setSelectedCourseForLessons(course);
    setCourseLessonsLoading(true);
    try {
      const res = await API.get(`/courses/${course._id}/lessons`);
      const lessons = (res.data || []).slice().sort((a, b) => {
        const ao = a.order || 0;
        const bo = b.order || 0;
        if (ao !== bo) return ao - bo;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      setCourseLessons(lessons);
    } catch (err) {
      alert(err.response?.data?.error || "Unable to load lessons");
      setCourseLessons([]);
    } finally {
      setCourseLessonsLoading(false);
    }
  }

  function closeLessonModal() {
    setIsLessonModalOpen(false);
    setEditingLesson(null);
    setLessonPdfFile(null);
    setLessonForm(lessonTemplate);
  }

  function openAddLessonModal() {
    if (!selectedCourseForLessons) return;
    setEditingLesson(null);
    setLessonPdfFile(null);
    setLessonForm(lessonTemplate);
    setIsLessonModalOpen(true);
  }

  function openEditLessonModal(lesson) {
    setEditingLesson(lesson);
    setLessonPdfFile(null);
    setLessonForm({
      title: lesson.title || "",
      description: lesson.description || "",
      order: lesson.order != null ? String(lesson.order) : "",
      videoUrl: lesson.videoUrl || "",
      durationSeconds:
        lesson.durationSeconds != null ? String(lesson.durationSeconds) : "",
      pdfUrl: lesson.pdfUrl || "",
    });
    setIsLessonModalOpen(true);
  }

  function handleLessonFieldChange(e) {
    setLessonForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleLessonPdfFileChange(e) {
    const file = e.target.files?.[0] || null;
    setLessonPdfFile(file);
  }

  async function saveLesson(e) {
    e.preventDefault();
    if (!selectedCourseForLessons) return;

    let finalPdfUrl = lessonForm.pdfUrl.trim();

    if (lessonPdfFile) {
      try {
        const fd = new FormData();
        fd.append("file", lessonPdfFile);
        const uploadRes = await API.post("/uploads/course-pdf", fd, {
          headers: authHeader(),
        });
        finalPdfUrl = uploadRes.data.url;
      } catch (err) {
        alert(err.response?.data?.error || "Unable to upload PDF material");
        return;
      }
    }

    const payload = {
      title: lessonForm.title.trim(),
      description: lessonForm.description,
      order: lessonForm.order === "" ? undefined : Number(lessonForm.order),
      videoUrl: lessonForm.videoUrl.trim(),
      durationSeconds:
        lessonForm.durationSeconds === ""
          ? undefined
          : Number(lessonForm.durationSeconds),
      pdfUrl: finalPdfUrl,
    };

    if (!payload.title || !payload.videoUrl) {
      alert("Lesson title and video URL are required");
      return;
    }

    try {
      if (editingLesson) {
        await API.put(
          `/courses/${selectedCourseForLessons._id}/lessons/${editingLesson._id}`,
          payload,
          { headers: authHeader() },
        );
        alert("Lesson updated successfully");
      } else {
        await API.post(
          `/courses/${selectedCourseForLessons._id}/lessons`,
          payload,
          {
            headers: authHeader(),
          },
        );
        alert("Lesson added successfully");
      }

      closeLessonModal();
      await showCourseLessons(selectedCourseForLessons);
      await loadLessonSummaries(courses);
    } catch (err) {
      alert(err.response?.data?.error || "Unable to save lesson");
    }
  }

  async function deleteLesson(lesson) {
    if (!selectedCourseForLessons) return;
    if (!window.confirm(`Delete lesson \"${lesson.title}\"?`)) return;
    try {
      await API.delete(
        `/courses/${selectedCourseForLessons._id}/lessons/${lesson._id}`,
        { headers: authHeader() },
      );
      await showCourseLessons(selectedCourseForLessons);
      await loadLessonSummaries(courses);
    } catch (err) {
      alert(err.response?.data?.error || "Unable to delete lesson");
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
          { headers: authHeader() },
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
    { id: "lessons", label: "Lessons", icon: BookOpen },
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
      <div
        className={`dashboard-main ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
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
            {activeTab === "profile" && (
              <AdminProfileEditor sessionUser={sessionUser} />
            )}

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
                            <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={u.name || "User"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src="/avatar-placeholder.svg"
                                  alt="User"
                                  className="w-full h-full object-cover"
                                />
                              )}
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
                            variant={u.role === "admin" ? "primary" : "neutral"}
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

            {(activeTab === "courses" || activeTab === "lessons") && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  activeTab === "lessons"
                    ? "space-y-6"
                    : "grid grid-cols-1 xl:grid-cols-3 gap-8 items-start"
                }
              >
                <div
                  className={`space-y-6 ${
                    activeTab === "lessons"
                      ? "xl:col-span-3"
                      : "order-2 xl:order-1 xl:col-span-2"
                  }`}
                >
                  {activeTab === "courses" && (
                    <>
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

                      <Card className="p-0 border border-white/5 bg-surface/50 overflow-hidden shadow-xl">
                        <div className="table-shell">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-ink-400 uppercase bg-surfaceHighlight/50 border-b border-white/5">
                              <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                  Course Name
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                  Tech Stack
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                  Price
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                  Description
                                </th>
                                <th className="px-6 py-4 text-right font-bold tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {courseLoading || courses.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan="5"
                                    className="p-12 text-center text-ink-400"
                                  >
                                    {courseLoading
                                      ? "Loading courses..."
                                      : "No courses available."}
                                  </td>
                                </tr>
                              ) : (
                                paginatedCourses.map((course) => (
                                  <tr
                                    key={course._id}
                                    className="hover:bg-white/5 transition-colors"
                                  >
                                    <td className="px-6 py-4 text-white font-semibold">
                                      {course.title}
                                    </td>
                                    <td className="px-6 py-4 text-ink-300">
                                      {course.tech}
                                    </td>
                                    <td className="px-6 py-4 text-rose-400 font-mono font-bold">
                                      ₹{course.price}
                                    </td>
                                    <td
                                      className="px-6 py-4 text-ink-300 max-w-[320px] truncate"
                                      title={course.description}
                                    >
                                      {course.description}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="inline-flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            startEditCourse(course)
                                          }
                                          title="Edit"
                                        >
                                          <Edit2 size={16} />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="danger"
                                          onClick={() =>
                                            deleteCourse(course._id)
                                          }
                                          title="Delete"
                                        >
                                          <Trash2 size={16} />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </Card>

                      <Pagination
                        currentPage={coursePage}
                        totalPages={totalCoursePages}
                        onPageChange={setCoursePage}
                      />
                    </>
                  )}

                  {activeTab === "lessons" && (
                    <Card className="p-0 border border-white/5 bg-surface/50 overflow-hidden shadow-xl">
                      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surfaceHighlight/5">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {selectedCourseForLessons
                              ? `Lessons - ${selectedCourseForLessons.title}`
                              : "Lesson Management"}
                          </h3>
                          <p className="text-sm text-ink-400">
                            {selectedCourseForLessons
                              ? "Manage lesson names, numbers, and content links."
                              : "Course-wise lesson counts and quick lesson controls."}
                          </p>
                        </div>
                        {selectedCourseForLessons && (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setSelectedCourseForLessons(null);
                              setCourseLessons([]);
                            }}
                          >
                            Back to Lesson Management
                          </Button>
                        )}
                      </div>

                      {!selectedCourseForLessons && (
                        <div className="table-shell">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-ink-400 uppercase bg-surfaceHighlight/50 border-b border-white/5">
                              <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                  Course Name
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                  Total Lessons
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                  Total Duration
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                  Last Lesson No.
                                </th>
                                <th className="px-6 py-4 text-right font-bold tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {courseLoading || courses.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan="5"
                                    className="p-12 text-center text-ink-400"
                                  >
                                    {courseLoading
                                      ? "Loading lesson summary..."
                                      : "No courses available."}
                                  </td>
                                </tr>
                              ) : (
                                courses.map((course) => {
                                  const summary = lessonSummaries[
                                    course._id
                                  ] || {
                                    count: 0,
                                    totalDurationSeconds: 0,
                                    highestOrder: 0,
                                  };

                                  return (
                                    <tr
                                      key={`lesson-summary-${course._id}`}
                                      className="hover:bg-white/5 transition-colors"
                                    >
                                      <td className="px-6 py-4 text-white font-semibold">
                                        {course.title}
                                      </td>
                                      <td className="px-6 py-4 text-ink-300 font-mono">
                                        {summary.count}
                                      </td>
                                      <td className="px-6 py-4 text-ink-300">
                                        {formatLessonDuration(
                                          summary.totalDurationSeconds,
                                        )}
                                      </td>
                                      <td className="px-6 py-4 text-ink-300 font-mono">
                                        {summary.highestOrder || "-"}
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <Button
                                          size="sm"
                                          onClick={async () => {
                                            setActiveTab("lessons");
                                            await showCourseLessons(course);
                                          }}
                                        >
                                          Lessons
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {selectedCourseForLessons && (
                        <div className="p-6 border-t border-white/5">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-white">
                                Lessons - {selectedCourseForLessons.title}
                              </h4>
                              <p className="text-xs text-ink-400">
                                Manage lesson names, numbers, and content links.
                              </p>
                            </div>
                            <Button onClick={openAddLessonModal}>
                              <Plus size={16} className="mr-2" /> Add Lesson
                            </Button>
                          </div>

                          <div className="table-shell rounded-xl border border-white/5">
                            <table className="w-full text-sm text-left">
                              <thead className="text-xs text-ink-400 uppercase bg-surfaceHighlight/50 border-b border-white/5">
                                <tr>
                                  <th className="px-6 py-4 font-bold tracking-wider">
                                    Lesson Name
                                  </th>
                                  <th className="px-6 py-4 font-bold tracking-wider">
                                    Lesson Number
                                  </th>
                                  <th className="px-6 py-4 text-right font-bold tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {courseLessonsLoading ? (
                                  <tr>
                                    <td
                                      colSpan="3"
                                      className="p-8 text-center text-ink-400"
                                    >
                                      Loading lessons...
                                    </td>
                                  </tr>
                                ) : courseLessons.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="3"
                                      className="p-8 text-center text-ink-400"
                                    >
                                      No lessons found for this course.
                                    </td>
                                  </tr>
                                ) : (
                                  courseLessons.map((lesson) => (
                                    <tr
                                      key={lesson._id}
                                      className="hover:bg-white/5 transition-colors"
                                    >
                                      <td className="px-6 py-4 text-white font-medium">
                                        {lesson.title}
                                      </td>
                                      <td className="px-6 py-4 text-ink-300 font-mono">
                                        {lesson.order || "-"}
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <div className="inline-flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                              setViewingLesson(lesson)
                                            }
                                            title="View"
                                          >
                                            <Eye size={16} />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                              openEditLessonModal(lesson)
                                            }
                                            title="Edit"
                                          >
                                            <Edit2 size={16} />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => deleteLesson(lesson)}
                                            title="Delete"
                                          >
                                            <Trash2 size={16} />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                </div>

                {activeTab === "courses" && (
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
                )}
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
                                    <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                      {user.avatar ? (
                                        <img
                                          src={user.avatar}
                                          alt={user.name || "User"}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <img
                                          src="/avatar-placeholder.svg"
                                          alt="User"
                                          className="w-full h-full object-cover"
                                        />
                                      )}
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
                      <MessageSquare size={32} className="mb-4 opacity-20" />
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
                              <img
                                src="/avatar-placeholder.svg"
                                alt="User"
                                className="w-full h-full object-cover rounded-full"
                              />
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
                                  {new Date(f.createdAt).toLocaleDateString()}
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
                                  <div className="break-all">{f.comment}</div>
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
                    Page{" "}
                    <span className="text-white font-bold">{feedbackPage}</span>{" "}
                    of{" "}
                    <span className="text-white font-bold">
                      {Math.max(1, totalFeedbackPages)}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setFeedbackPage((p) =>
                        Math.min(totalFeedbackPages, p + 1),
                      )
                    }
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
                          <img
                            src="/avatar-placeholder.svg"
                            alt="User"
                            className="w-full h-full object-cover rounded-full"
                          />
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
              document.body,
            )}

          {viewingLesson &&
            createPortal(
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={() => setViewingLesson(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-4xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="flex justify-between items-center p-6 border-b border-white/5 bg-surfaceHighlight/20">
                    <div>
                      <h3 className="font-bold text-ink-100 flex items-center gap-2">
                        <Eye size={18} className="text-rose-400" />
                        Lesson Preview
                      </h3>
                      <p className="text-xs text-ink-400 mt-1">
                        {viewingLesson.title}
                      </p>
                    </div>
                    <button
                      onClick={() => setViewingLesson(null)}
                      className="text-ink-400 hover:text-ink-100 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {viewingLesson.videoUrl ? (
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
                        <video
                          src={viewingLesson.videoUrl}
                          controls
                          controlsList="nodownload"
                          className="w-full max-h-[70vh] bg-black"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-surfaceHighlight/20 p-8 text-center text-ink-400">
                        Video URL not available for this lesson.
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-400">
                      <span>Lesson Number: {viewingLesson.order || "-"}</span>
                      {viewingLesson.durationSeconds ? (
                        <span>
                          Duration:{" "}
                          {formatLessonDuration(viewingLesson.durationSeconds)}
                        </span>
                      ) : (
                        <span>Duration: -</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>,
              document.body,
            )}

          {isLessonModalOpen &&
            createPortal(
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={closeLessonModal}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-3xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="flex justify-between items-center p-6 border-b border-white/5 bg-surfaceHighlight/20">
                    <h3 className="font-bold text-ink-100 flex items-center gap-2">
                      <BookOpen size={18} className="text-rose-400" />
                      {editingLesson ? "Edit Lesson" : "Add Lesson"}
                    </h3>
                    <button
                      onClick={closeLessonModal}
                      className="text-ink-400 hover:text-ink-100 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={saveLesson} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
                          Lesson Name
                        </label>
                        <Input
                          name="title"
                          value={lessonForm.title}
                          onChange={handleLessonFieldChange}
                          required
                          placeholder="Lesson title"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
                          Video URL
                        </label>
                        <Input
                          name="videoUrl"
                          value={lessonForm.videoUrl}
                          onChange={handleLessonFieldChange}
                          required
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
                          Lesson Number
                        </label>
                        <Input
                          type="number"
                          name="order"
                          value={lessonForm.order}
                          onChange={handleLessonFieldChange}
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
                          Duration (seconds)
                        </label>
                        <Input
                          type="number"
                          name="durationSeconds"
                          value={lessonForm.durationSeconds}
                          onChange={handleLessonFieldChange}
                          placeholder="300"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
                          Lesson PDF Material
                        </label>
                        <div className="space-y-2">
                          <label className="inline-flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg bg-surfaceHighlight/60 hover:bg-surfaceHighlight border border-white/10 text-sm text-ink-100 transition-colors">
                            <span>Upload PDF</span>
                            <input
                              type="file"
                              accept="application/pdf"
                              hidden
                              onChange={handleLessonPdfFileChange}
                            />
                          </label>
                          {lessonPdfFile && (
                            <p className="text-xs text-ink-400 truncate">
                              Selected: {lessonPdfFile.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
                          PDF URL (optional)
                        </label>
                        <Input
                          name="pdfUrl"
                          value={lessonForm.pdfUrl}
                          onChange={handleLessonFieldChange}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={lessonForm.description}
                          onChange={handleLessonFieldChange}
                          placeholder="Brief lesson description"
                          className="w-full bg-surface border border-white/10 rounded-xl p-3 text-sm text-ink-100 focus:border-rose-500 outline-none min-h-[120px] resize-y placeholder:text-ink-600 transition-colors focus:bg-surfaceHighlight/20"
                        />
                      </div>
                    </div>

                    <div className="pt-1 flex justify-end gap-2 border-t border-white/5">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={closeLessonModal}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingLesson ? "Save Lesson" : "Add Lesson"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>,
              document.body,
            )}
        </div>
      </div>
    </div>
  );
}
