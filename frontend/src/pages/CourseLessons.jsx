import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Play,
  CheckCircle,
  Lock,
  Plus,
  Edit3,
  Trash2,
  ChevronLeft,
  FileVideo,
  Clock,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import API from "../api";
import { authHeader, getCurrentUser, getToken } from "../auth";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";

export default function CourseLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [error, setError] = useState("");
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isAdmin = currentUser?.role === "admin";
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    order: "",
    file: null,
    pdfFile: null,
    durationSeconds: undefined,
  });
  const [editingLesson, setEditingLesson] = useState(null);
  const [message, setMessage] = useState("");

  // Load course metadata
  useEffect(() => {
    setLoadingCourse(true);
    API.get("/courses")
      .then((r) => {
        const found = r.data.find((x) => x._id === id);
        if (!found) setError("Course not found");
        setCourse(found || null);
      })
      .catch(() => setError("Unable to load course"))
      .finally(() => setLoadingCourse(false));
  }, [id]);

  // Load lessons
  useEffect(() => {
    setLoadingLessons(true);
    API.get(`/courses/${id}/lessons`)
      .then((r) => setLessons(r.data || []))
      .catch(() => setError("Unable to load lessons"))
      .finally(() => setLoadingLessons(false));
  }, [id]);

  // Purchase check
  useEffect(() => {
    const token = getToken();
    if (!token || isAdmin) {
      setHasPurchased(false);
      setCheckingPurchase(false);
      return;
    }
    setCheckingPurchase(true);
    API.get("/purchases/me", { headers: authHeader() })
      .then((r) => {
        const match = r.data.find(
          (entry) => entry.course?._id === id && entry.status === "success"
        );
        setHasPurchased(!!match);
      })
      .catch(() => { })
      .finally(() => setCheckingPurchase(false));
  }, [id, isAdmin]);

  const canWatch = isAdmin || hasPurchased;

  const sortedLessons = useMemo(() => {
    return (lessons || []).slice().sort((a, b) => {
      const ao = a.order || 0;
      const bo = b.order || 0;
      if (ao !== bo) return ao - bo;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [lessons]);

  useEffect(() => {
    if (sortedLessons.length && !currentLessonId) {
      setCurrentLessonId(sortedLessons[0]._id);
    }
  }, [sortedLessons, currentLessonId]);

  const activeLesson = sortedLessons.find((l) => l._id === currentLessonId) || sortedLessons[0];

  function handleSelectLesson(lessonId) {
    setCurrentLessonId(lessonId);
  }

  function handleLessonField(e) {
    const { name, value } = e.target;
    setLessonForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleLessonFile(e) {
    const file = e.target.files?.[0] || null;
    const name = e.target.name; // 'file' or 'pdfFile'

    if (name === 'pdfFile') {
      setLessonForm((prev) => ({ ...prev, pdfFile: file }));
      return;
    }

    if (!file) {
      setLessonForm((prev) => ({ ...prev, file: null, durationSeconds: undefined }));
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const secs = Number.isFinite(video.duration) ? Math.round(video.duration) : undefined;
      setLessonForm((prev) => ({ ...prev, file, durationSeconds: secs }));
    };
    video.onerror = () => {
      setLessonForm((prev) => ({ ...prev, file, durationSeconds: undefined }));
    };
    video.src = URL.createObjectURL(file);
  }

  function startNewLesson() {
    setEditingLesson(null);
    setLessonForm({
      title: "",
      description: "",
      order: "",
      file: null,
      pdfFile: null,
      durationSeconds: undefined,
    });
    setMessage("");
  }

  function startEditLesson(lesson) {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || "",
      description: lesson.description || "",
      order: lesson.order != null ? String(lesson.order) : "",
      file: null,
      pdfFile: null,
      durationSeconds: typeof lesson.durationSeconds === "number" ? lesson.durationSeconds : undefined,
    });
    setMessage("");
  }

  async function handleSubmitLesson(e) {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      setUploading(true);
      setMessage("");

      let videoUrl = editingLesson?.videoUrl || "";
      let pdfUrl = editingLesson?.pdfUrl || "";

      if (!editingLesson && !lessonForm.file) {
        setMessage("Please choose a video file.");
        setUploading(false);
        return;
      }

      // Upload Video
      if (lessonForm.file) {
        const fd = new FormData();
        fd.append("video", lessonForm.file);
        const uploadRes = await API.post("/uploads/course-video", fd, { headers: authHeader() });
        videoUrl = uploadRes.data.url;
      }

      // Upload PDF
      if (lessonForm.pdfFile) {
        const fd = new FormData();
        fd.append("file", lessonForm.pdfFile);
        const uploadRes = await API.post("/uploads/course-pdf", fd, { headers: authHeader() });
        pdfUrl = uploadRes.data.url;
      }

      const body = {
        title: lessonForm.title,
        description: lessonForm.description,
        order: lessonForm.order !== "" ? Number(lessonForm.order) : undefined,
        videoUrl,
        pdfUrl,
        durationSeconds: typeof lessonForm.durationSeconds === "number" ? lessonForm.durationSeconds : undefined,
      };

      if (!body.title || !videoUrl) {
        setMessage("Title and video are required.");
        setUploading(false);
        return;
      }

      if (editingLesson) {
        const res = await API.put(`/courses/${id}/lessons/${editingLesson._id}`, body, { headers: authHeader() });
        const updated = res.data;
        setLessons((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
        setMessage("Lesson updated successfully");
      } else {
        const res = await API.post(`/courses/${id}/lessons`, body, { headers: authHeader() });
        const created = res.data;
        setLessons((prev) => [...prev, created]);
        setMessage("Lesson created successfully");
        startNewLesson();
      }

      if (!editingLesson) {
        setLessonForm(curr => ({ ...curr, file: null, pdfFile: null, title: "", description: "" }));
      }

    } catch (err) {
      setMessage(err.response?.data?.error || "Unable to save lesson. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteLesson(lesson) {
    if (!isAdmin) return;
    const confirmDelete = window.confirm(`Delete lesson "${lesson.title}"? This cannot be undone.`);
    if (!confirmDelete) return;
    try {
      await API.delete(`/courses/${id}/lessons/${lesson._id}`, { headers: authHeader() });
      setLessons((prev) => prev.filter((l) => l._id !== lesson._id));
      if (currentLessonId === lesson._id) setCurrentLessonId(null);
    } catch (err) {
      setMessage(err.response?.data?.error || "Unable to delete lesson.");
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loadingCourse) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-8 w-8 text-brand-500 border-2 border-current border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!course || error) {
    return (
      <Card className="p-8 text-center text-ink-400 max-w-lg mx-auto mt-20">
        {error || "Course not found"}
        <Button className="mt-4" onClick={() => navigate('/courses')}>Browse Courses</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link to={`/courses/${id}`} className="inline-flex items-center text-sm text-brand-400 hover:text-brand-300 transition-colors mb-2">
            <ChevronLeft size={16} className="mr-1" /> Back to Course Overview
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-white text-balance">{course.title}</h1>
            <Badge variant="outline" className="border-brand-500/30 text-brand-300">{course.tech}</Badge>
          </div>
        </div>
        <div>
          {checkingPurchase ? (
            <Badge variant="warning">Verifying access...</Badge>
          ) : canWatch ? (
            <Badge variant="success" className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <CheckCircle size={14} className="mr-1.5" /> Premium Access
            </Badge>
          ) : (
            <Badge variant="warning" className="px-3 py-1">
              <Lock size={14} className="mr-1.5" /> Purchase Required
            </Badge>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr),320px] gap-6">

        {/* Main Content: Player */}
        <div className="space-y-6">
          <Card className="overflow-hidden border border-white/5 bg-black/40 p-0">
            {activeLesson ? (
              <div className="aspect-video bg-black relative w-full">
                {canWatch && activeLesson.videoUrl ? (
                  <video
                    key={activeLesson._id}
                    src={activeLesson.videoUrl}
                    controls
                    controlsList="nodownload"
                    className="w-full h-full"
                    poster={course.thumbnail}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/50 text-center p-6">
                    <Lock size={48} className="text-white/20 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Content Locked</h3>
                    <p className="text-sm text-ink-400 max-w-xs mb-6">
                      {getToken() ? "You need to purchase this course to watch this lesson." : "Please login and purchase the course to watch."}
                    </p>
                    {!canWatch && !isAdmin && (
                      <Button onClick={() => navigate(`/courses/${id}`)}>Go to Purchase</Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-ink-500 bg-surface/30">
                No lesson selected
              </div>
            )}

            <div className="p-6">
              {activeLesson ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">
                        {activeLesson.title}
                      </h2>
                      {activeLesson.durationSeconds && (
                        <div className="flex items-center text-xs text-ink-500 font-mono">
                          <Clock size={12} className="mr-1" />
                          {formatDuration(activeLesson.durationSeconds)}
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => startEditLesson(activeLesson)}>
                          <Edit3 size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                  {activeLesson.description && (
                    <div className="p-4 rounded-lg bg-surface/50 border border-white/5 text-sm text-ink-300 leading-relaxed">
                      {activeLesson.description}
                    </div>
                  )}

                  {activeLesson.pdfUrl && canWatch && (
                    <div className="mt-4">
                      <a
                        href={activeLesson.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-400 rounded-lg hover:bg-brand-500/20 transition-colors border border-brand-500/20 font-medium text-sm"
                      >
                        <FileText size={18} /> Download Lesson PDF
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-ink-500 text-sm">Select a lesson from the playlist to start watching.</div>
              )}
            </div>
          </Card>

          {/* Admin Form */}
          {isAdmin && (
            <Card className="p-6 border border-brand-500/20 bg-brand-500/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  {editingLesson ? <Edit3 size={18} /> : <Plus size={18} />}
                  {editingLesson ? "Edit Lesson" : "Add New Lesson"}
                </h3>
                {editingLesson && (
                  <Button size="sm" variant="ghost" onClick={startNewLesson}>Cancel Edit</Button>
                )}
              </div>

              <form onSubmit={handleSubmitLesson} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-ink-400">Lesson Title</label>
                    <Input
                      name="title"
                      value={lessonForm.title}
                      onChange={handleLessonField}
                      required
                      placeholder="Ex: Introduction to React"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-ink-400">Order</label>
                    <Input
                      name="order"
                      type="number"
                      value={lessonForm.order}
                      onChange={handleLessonField}
                      placeholder="Auto"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink-400">Description</label>
                  <textarea
                    name="description"
                    value={lessonForm.description}
                    onChange={handleLessonField}
                    className="w-full rounded-xl bg-canvas border border-white/10 p-3 text-sm text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-ink-600 min-h-[100px]"
                    placeholder="Brief summary of this lesson..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink-400">
                    Video File {editingLesson ? "(Optional - keep existing)" : "(Required)"}
                  </label>
                  <div className="relative">
                    <Input
                      name="file"
                      type="file"
                      accept="video/*"
                      onChange={handleLessonFile}
                      className="py-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink-400">
                    Lesson PDF Material {editingLesson ? "(Optional - keep existing)" : "(Optional)"}
                  </label>
                  <div className="relative">
                    <Input
                      name="pdfFile"
                      type="file"
                      accept="application/pdf"
                      onChange={handleLessonFile}
                      className="py-2"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  {message && (
                    <p className={`text-sm mb-3 ${message.includes("success") ? "text-emerald-400" : "text-red-400"}`}>
                      {message}
                    </p>
                  )}
                  <Button type="submit" isLoading={uploading} className="w-full">
                    {editingLesson ? "Update Lesson" : "Create Lesson"}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Sidebar: Playlist */}
        <div className="lg:h-[calc(100vh-120px)] lg:sticky lg:top-24 flex flex-col">
          <Card className="flex flex-col h-full border border-white/5 bg-surface/30 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-surfaceHighlight/20 flex items-center justify-between">
              <h2 className="font-bold text-white flex items-center gap-2">
                <FileVideo size={18} className="text-brand-400" />
                Course Content
              </h2>
              <Badge variant="outline" className="text-xs bg-black/20">{sortedLessons.length} Lessons</Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {loadingLessons ? (
                <div className="flex flex-col items-center justify-center py-10 text-ink-500 gap-2">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Loading list...</span>
                </div>
              ) : sortedLessons.length === 0 ? (
                <div className="text-center py-10 px-4 text-ink-500 text-sm">
                  No lessons added yet.
                </div>
              ) : (
                sortedLessons.map((lesson, idx) => {
                  const isActive = lesson._id === activeLesson?._id;
                  return (
                    <div
                      key={lesson._id}
                      className={`group relative p-3 rounded-lg cursor-pointer border transition-all duration-200 ${isActive
                        ? "bg-brand-500/10 border-brand-500/30"
                        : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"
                        }`}
                      onClick={() => handleSelectLesson(lesson._id)}
                    >
                      <div className="flex gap-3">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono mt-0.5 shrink-0 transition-colors ${isActive ? "bg-brand-500 text-white" : "bg-white/5 text-ink-500 group-hover:bg-white/10 group-hover:text-ink-300"
                          }`}>
                          {isActive ? <Play size={10} fill="currentColor" /> : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate mb-0.5 ${isActive ? "text-brand-300" : "text-ink-300 group-hover:text-white"}`}>
                            {lesson.title}
                          </div>
                          <div className="flex items-center justify-between text-xs text-ink-600">
                            <span>
                              {lesson.durationSeconds ? formatDuration(lesson.durationSeconds) : "Video"}
                            </span>
                            {isAdmin && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                title="Delete Lesson"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
