import React, { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Shield, Menu } from "lucide-react";

import API from "../api";
import { authHeader, getCurrentUser, updateStoredUser } from "../auth";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import AdminPanel from "./AdminPanel";
import UserSidebar from "../components/UserSidebar";
import Transactions from "./Transactions";
import Feedback from "./Feedback";

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

  const sortedEnrollments = [...enrolled].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const totalPages = Math.max(
    1,
    Math.ceil(sortedEnrollments.length / PER_PAGE),
  );
  const paginatedEnrolled = sortedEnrollments.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );
  const showPagination = sortedEnrollments.length > PER_PAGE;

  if (loading)
    return (
      <div className="text-center p-12 text-ink-400">
        Loading your courses...
      </div>
    );

  if (enrolled.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">My Learning</h2>
            <p className="text-ink-400">
              Start your first course and track your progress here.
            </p>
          </div>
          <Link to="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>

        <Card className="p-10 text-center bg-surface/50 border border-white/5">
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
            <Button>Explore Courses</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">My Learning</h2>
          <p className="text-ink-400">
            All your enrolled courses in one place.
          </p>
        </div>
        <div className="text-sm text-ink-400">
          Total courses: {sortedEnrollments.length}
        </div>
      </div>

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
                      variant={
                        entry.status === "success" ? "success" : "warning"
                      }
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
      {showPagination && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function UserProfilePanel({ sessionUser, onUserUpdate }) {
  const [profile, setProfile] = useState(sessionUser || null);
  const [form, setForm] = useState({ name: "", avatar: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionUser) {
      setProfile(sessionUser);
      setForm({
        name: sessionUser.name || "",
        avatar: sessionUser.avatar || "",
      });
    }
  }, [sessionUser]);

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
      if (onUserUpdate) onUserUpdate(res.data);
      setMessage({ type: "success", text: "Profile updated successfully." });
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
    return <div className="p-12 text-center text-ink-400">Loading...</div>;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Welcome, {profile.name || "Learner"}
          </h2>
          <p className="text-ink-400">
            Keep your profile updated so instructors can personalize your
            learning experience.
          </p>
        </div>
        <Card className="p-8 bg-surface/50 border border-white/5">
          <h3 className="text-xl font-bold text-white mb-6">Profile</h3>

          <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-brand-500 to-purple-500 p-[1px]">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <img
                    src="/avatar-placeholder.svg"
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{profile.name}</p>
                <p className="text-sm text-ink-400">{profile.email}</p>
              </div>
            </div>
          </div>

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

            <div className="pt-2">
              <Button type="submit" isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function ChangePasswordPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function handleChangePassword(e) {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setPassLoading(true);
    try {
      await API.put(
        "/auth/me",
        { currentPassword, newPassword },
        { headers: authHeader() },
      );
      setMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to update password.",
      });
    } finally {
      setPassLoading(false);
    }
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-2xl">
        <Card className="p-8 bg-surface/50 border border-white/5">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield size={24} className="text-brand-400" />
            Change Password
          </h3>

          <div className="bg-black/20 rounded-xl p-6 border border-white/5">
            <div className="mb-6">
              <h4 className="font-bold text-white mb-1">Change Password</h4>
              <p className="text-sm text-ink-400">
                Update your account password using your current password.
              </p>
            </div>

            {message.text && (
              <div
                className={`mb-6 p-3 rounded-lg text-sm ${
                  message.type === "error"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-green-500/10 text-green-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <form
              onSubmit={handleChangePassword}
              className="space-y-4 max-w-sm"
            >
              <div>
                <label className="block text-xs font-semibold text-ink-400 mb-1">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-400 mb-1">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-400 mb-1">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={passLoading}
                  className="w-full"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    function handleSessionChange() {
      setUser(getCurrentUser());
    }

    window.addEventListener("session:changed", handleSessionChange);
    window.addEventListener("session:user-updated", handleSessionChange);
    return () => {
      window.removeEventListener("session:changed", handleSessionChange);
      window.removeEventListener("session:user-updated", handleSessionChange);
    };
  }, []);

  if (user?.role === "admin") {
    return <AdminPanel />;
  }

  const activeTab = location.pathname.includes("/dashboard/profile")
    ? "profile"
    : location.pathname.includes("/dashboard/transactions")
      ? "transactions"
      : location.pathname.includes("/dashboard/feedback")
        ? "feedback"
        : location.pathname.includes("/dashboard/security")
          ? "security"
          : "overview";

  const tabLabel =
    activeTab === "profile"
      ? "Profile"
      : activeTab === "transactions"
        ? "Transactions"
        : activeTab === "feedback"
          ? "Feedback"
          : activeTab === "security"
            ? "Change Password"
            : "My Learning";

  const handleTabChange = (tabId) => {
    if (tabId === "profile") {
      navigate("/dashboard/profile");
      return;
    }
    if (tabId === "transactions") {
      navigate("/dashboard/transactions");
      return;
    }
    if (tabId === "feedback") {
      navigate("/dashboard/feedback");
      return;
    }
    if (tabId === "security") {
      navigate("/dashboard/security");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="dashboard-root">
      <UserSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        currentUser={user}
      />

      <div
        className={`dashboard-main ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <div className="dashboard-container">
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white uppercase tracking-wider">
              {tabLabel}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} className="mr-2" /> Menu
            </Button>
          </div>

          <Routes>
            <Route path="/" element={<Enrolled />} />
            <Route
              path="profile"
              element={
                <UserProfilePanel sessionUser={user} onUserUpdate={setUser} />
              }
            />
            <Route path="transactions" element={<Transactions />} />
            <Route path="feedback" element={<Feedback embedded />} />
            <Route path="security" element={<ChangePasswordPanel />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
