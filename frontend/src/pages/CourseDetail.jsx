import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Award,
  BookOpen,
  CheckCircle,
  ShieldCheck,
  Play,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  CreditCard,
  ChevronRight,
  Star,
  MessageSquare,
} from "lucide-react";
import API from "../api";
import { authHeader, getCurrentUser, getToken } from "../auth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { DEMO_WAIT_SECONDS } from "../config";

const featureList = [
  "Downloadable project briefs",
  "Lifetime dashboard access",
  "Peer code review templates",
  "Certificate of Completion",
];

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState("idle");
  const [countdown, setCountdown] = useState(DEMO_WAIT_SECONDS);
  const [showModal, setShowModal] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [adminEditMode, setAdminEditMode] = useState(false);
  const [adminForm, setAdminForm] = useState({
    title: "",
    description: "",
    price: "",
    tech: "",
    imageUrl: "",
  });

  const waitSeconds = DEMO_WAIT_SECONDS;
  const isProcessing = purchaseStatus === "processing";
  const progressPercent = isProcessing
    ? Math.min(100, ((waitSeconds - countdown) / waitSeconds) * 100)
    : 100;

  const currentUser = useMemo(() => getCurrentUser(), []);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    setLoading(true);
    API.get("/courses")
      .then((r) => {
        const found = r.data.find((x) => x._id === id);
        setCourse(found);
        if (found) {
          setAdminForm({
            title: found.title,
            description: found.description,
            price: found.price,
            tech: found.tech,
            imageUrl: found.imageUrl || "",
          });
        } else {
          setError("Course not found");
        }
      })
      .catch(() => setError("Unable to load course"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    API.get("/purchases/me", { headers: authHeader() })
      .then((r) => {
        const match = r.data.find(
          (entry) => entry.course?._id === id && entry.status === "success"
        );
        if (match) setHasPurchased(true);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (purchaseStatus !== "processing") return undefined;
    setCountdown(waitSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const interval = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [purchaseStatus, waitSeconds]);

  async function handleBuy() {
    if (!getToken()) {
      navigate("/login");
      return;
    }
    if (hasPurchased) return;

    try {
      setPurchaseStatus("processing");
      setError("");
      setShowModal(true);

      const res = await API.post(
        "/purchases/create-checkout-session",
        { courseId: id },
        { headers: authHeader() }
      );

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (err) {
      setPurchaseStatus("error");
      setError(err.response?.data?.error || "Purchase failed, please retry.");
    }
  }

  function handleAdminField(e) {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  }

  async function handleAdminUpdate(e) {
    e.preventDefault();
    try {
      const res = await API.put(`/courses/${id}`, adminForm, {
        headers: authHeader(),
      });
      setCourse(res.data);
      setAdminEditMode(false);
      alert("Course updated successfully");
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
  }

  async function handleAdminDelete() {
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    await API.delete(`/courses/${id}`, { headers: authHeader() });
    navigate("/courses");
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-400">
        Loading Course...
      </div>
    );
  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Course not found.
      </div>
    );

  const canPreview = isAdmin || hasPurchased;

  return (
    <div className="min-h-screen bg-canvas pb-20">
      {/* Hero Section */}
      <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={course.imageUrl || "/assets/placeholder.svg"}
            alt={course.title}
            className="w-full h-full object-cover blur-sm"
          />
          {/* Non-destructive dark overlay to keep image design but darken visuals */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/80 to-transparent" />
        </div>

        <div className="relative z-10 section-shell h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl space-y-6"
          >
            <Badge variant="primary" className="mb-4">
              {course.tech || "MERN Stack"}
            </Badge>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold text-white leading-tight text-balance">
              {course.title}
            </h1>
            <p className="text-lg sm:text-xl text-ink-300 max-w-3xl leading-relaxed text-balance">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-medium text-ink-400">
              <div className="flex items-center gap-2">
                <Clock className="text-brand-400" size={20} />
                <span>{course.duration || "12 Weeks"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="text-yellow-400" size={20} />
                <span>Certificate Included</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-green-400" size={20} />
                <span>Money-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Star
                  className={
                    course.ratingCount > 0
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-ink-400"
                  }
                  size={20}
                />
                <span className="font-medium text-ink-200">
                  {course.ratingCount > 0 ? (
                    <>
                      <span className="text-white font-bold">
                        {Number(course.averageRating).toFixed(1)}
                      </span>{" "}
                      ({course.ratingCount} reviews)
                    </>
                  ) : (
                    "Not yet rated"
                  )}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="section-shell -mt-20 relative z-20">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Detailed Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 bg-surface/50 border border-white/5 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6">
                What you'll learn
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {featureList.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <CheckCircle
                      className="text-green-400 shrink-0 mt-0.5"
                      size={20}
                    />
                    <span className="text-ink-200 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Admin Panel */}
            {isAdmin && (
              <Card className="p-8 border-brand-500/30 bg-brand-500/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 text-brand-400">
                    <ShieldCheck size={24} />
                    <h3 className="text-lg font-bold">Admin Controls</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAdminEditMode(!adminEditMode)}
                    >
                      <Edit2 size={16} className="mr-2" />{" "}
                      {adminEditMode ? "Cancel" : "Edit Course"}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={handleAdminDelete}
                    >
                      <Trash2 size={16} className="mr-2" /> Delete
                    </Button>
                  </div>
                </div>

                {adminEditMode && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    onSubmit={handleAdminUpdate}
                    className="space-y-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-ink-400 mb-1">
                          Title
                        </label>
                        <Input
                          name="title"
                          value={adminForm.title}
                          onChange={handleAdminField}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink-400 mb-1">
                          Tech Stack
                        </label>
                        <Input
                          name="tech"
                          value={adminForm.tech}
                          onChange={handleAdminField}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink-400 mb-1">
                          Price (INR)
                        </label>
                        <Input
                          type="number"
                          name="price"
                          value={adminForm.price}
                          onChange={handleAdminField}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink-400 mb-1">
                          Image URL
                        </label>
                        <Input
                          name="imageUrl"
                          value={adminForm.imageUrl}
                          onChange={handleAdminField}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-400 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={adminForm.description}
                        onChange={handleAdminField}
                        className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-500 outline-none"
                        rows={4}
                      />
                    </div>
                    <div className="text-right">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </motion.form>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar / CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="p-6 border border-white/10 shadow-glow bg-surface">
                <div className="mb-6">
                  <p className="text-sm text-ink-400 uppercase tracking-wider font-semibold">
                    Total Price
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ₹{course.price}
                    </span>
                    <span className="text-lg text-ink-400 line-through">
                      ₹{Number(course.price) * 1.5}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {canPreview ? (
                    <Link to={`/courses/${id}/lessons`}>
                      <Button size="xl" className="w-full">
                        <Play size={20} className="mr-2" /> Continue Learning
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="xl"
                      className="w-full shadow-lg shadow-brand-500/25"
                      onClick={handleBuy}
                      disabled={isProcessing}
                      isLoading={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Enroll Now"}{" "}
                      <ChevronRight size={20} className="ml-2" />
                    </Button>
                  )}

                  {hasPurchased && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        navigate("/feedback", {
                          state: {
                            courseId: course._id,
                            courseTitle: course.title,
                          },
                        })
                      }
                    >
                      <MessageSquare size={20} className="mr-2" /> Rate this
                      Course
                    </Button>
                  )}

                  {!canPreview && (
                    <p className="text-xs text-center text-ink-400 flex items-center justify-center gap-1">
                      <ShieldCheck size={12} /> 14-day money-back guarantee
                    </p>
                  )}
                </div>
              </Card>

              {/* Author / Meta */}
              <Card className="p-6 bg-transparent border border-white/5">
                <h3 className="font-bold text-white mb-4">Course Includes</h3>
                <ul className="space-y-3 text-sm text-ink-300">
                  <li className="flex items-center gap-3">
                    <BookOpen size={16} className="text-brand-400" />
                    <span>40+ Hours of HD Video</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock size={16} className="text-brand-400" />
                    <span>Full Lifetime Access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Award size={16} className="text-brand-400" />
                    <span>Certificate on Completion</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="p-8 border border-white/10 shadow-2xl relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-ink-400 hover:text-white"
                >
                  <X size={20} />
                </button>

                <div className="text-center mb-8">
                  <div className="inline-flex p-4 rounded-full bg-brand-500/10 text-brand-400 mb-4 animate-pulse">
                    <CreditCard size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Processing Purchase
                  </h3>
                  <p className="text-ink-400 text-sm mt-2">
                    Please wait while we secure your enrollment.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-surfaceHighlight rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full bg-brand-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-ink-400 font-medium mb-8">
                  <span>Initiating</span>
                  <span>Verifying</span>
                  <span>Confirming</span>
                </div>

                <div className="bg-surfaceHighlight/50 rounded-xl p-4 text-xs text-ink-300 border border-white/5">
                  <p className="flex items-center gap-2 mb-2 font-bold text-white">
                    <AlertCircle size={14} className="text-blue-400" /> Demo
                    Mode
                  </p>
                  <p>
                    You will be redirected to the Stripe test checkout. No real
                    money will be charged.
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
