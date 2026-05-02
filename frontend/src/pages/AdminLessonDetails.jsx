import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Edit2, Eye, Plus, Trash2, X } from "lucide-react";

import API from "../api";
import { authHeader, getCurrentUser } from "../auth";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const lessonTemplate = {
  title: "",
  description: "",
  order: "",
  videoUrl: "",
  durationSeconds: "",
  pdfUrl: "",
};

export default function AdminLessonDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState(lessonTemplate);

  useEffect(() => {
    if (!courseId) return;
    loadPageData();
  }, [courseId]);

  async function loadPageData() {
    setLoading(true);
    try {
      const [coursesRes, lessonsRes] = await Promise.all([
        API.get("/courses"),
        API.get(`/courses/${courseId}/lessons`),
      ]);

      const foundCourse = (coursesRes.data || []).find(
        (c) => c._id === courseId,
      );
      setCourse(foundCourse || null);

      const sortedLessons = (lessonsRes.data || []).slice().sort((a, b) => {
        const ao = a.order || 0;
        const bo = b.order || 0;
        if (ao !== bo) return ao - bo;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      setLessons(sortedLessons);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Unable to load lesson details");
    } finally {
      setLoading(false);
    }
  }

  function closeLessonModal() {
    setIsLessonModalOpen(false);
    setEditingLesson(null);
    setLessonForm(lessonTemplate);
  }

  function openAddLessonModal() {
    setEditingLesson(null);
    setLessonForm(lessonTemplate);
    setIsLessonModalOpen(true);
  }

  function openEditLessonModal(lesson) {
    setEditingLesson(lesson);
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

  async function saveLesson(e) {
    e.preventDefault();
    if (!courseId) return;

    const payload = {
      title: lessonForm.title.trim(),
      description: lessonForm.description,
      order: lessonForm.order === "" ? undefined : Number(lessonForm.order),
      videoUrl: lessonForm.videoUrl.trim(),
      durationSeconds:
        lessonForm.durationSeconds === ""
          ? undefined
          : Number(lessonForm.durationSeconds),
      pdfUrl: lessonForm.pdfUrl.trim(),
    };

    if (!payload.title || !payload.videoUrl) {
      alert("Lesson title and video URL are required");
      return;
    }

    try {
      if (editingLesson) {
        await API.put(
          `/courses/${courseId}/lessons/${editingLesson._id}`,
          payload,
          {
            headers: authHeader(),
          },
        );
        alert("Lesson updated successfully");
      } else {
        await API.post(`/courses/${courseId}/lessons`, payload, {
          headers: authHeader(),
        });
        alert("Lesson added successfully");
      }

      closeLessonModal();
      await loadPageData();
    } catch (err) {
      alert(err.response?.data?.error || "Unable to save lesson");
    }
  }

  async function deleteLesson(lesson) {
    if (!courseId) return;
    if (!window.confirm(`Delete lesson \"${lesson.title}\"?`)) return;

    try {
      await API.delete(`/courses/${courseId}/lessons/${lesson._id}`, {
        headers: authHeader(),
      });
      await loadPageData();
    } catch (err) {
      alert(err.response?.data?.error || "Unable to delete lesson");
    }
  }

  if (currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="dashboard-root">
      <div className="dashboard-main lg:ml-0">
        <div className="dashboard-container space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                to="/dashboard"
                className="inline-flex items-center text-sm text-ink-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Admin Dashboard
              </Link>
              <h1 className="text-3xl font-display font-bold text-white mt-2">
                Lessons - {course?.title || "Course"}
              </h1>
              <p className="text-ink-400 text-sm">
                Manage lesson names, numbers, and content links.
              </p>
            </div>
            <Button onClick={openAddLessonModal}>
              <Plus size={16} className="mr-2" /> Add Lesson
            </Button>
          </div>

          <Card className="p-0 border border-white/5 bg-surface/50 overflow-hidden shadow-xl">
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
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-ink-400">
                        Loading lessons...
                      </td>
                    </tr>
                  ) : lessons.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-ink-400">
                        No lessons found for this course.
                      </td>
                    </tr>
                  ) : (
                    lessons.map((lesson) => (
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
                                window.open(
                                  lesson.videoUrl,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                              title="View"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditLessonModal(lesson)}
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
          </Card>
        </div>
      </div>

      {isLessonModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={closeLessonModal}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-surfaceHighlight/20">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-rose-400" />
                  {editingLesson ? "Edit Lesson" : "Add Lesson"}
                </h3>
                <button
                  onClick={closeLessonModal}
                  className="text-ink-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={saveLesson} className="p-6 space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
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
                    PDF URL (optional)
                  </label>
                  <Input
                    name="pdfUrl"
                    value={lessonForm.pdfUrl}
                    onChange={handleLessonFieldChange}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={lessonForm.description}
                    onChange={handleLessonFieldChange}
                    placeholder="Brief lesson description"
                    className="w-full bg-surface border border-white/10 rounded-xl p-3 text-sm text-white focus:border-rose-500 outline-none min-h-[100px] resize-y placeholder:text-ink-600 transition-colors focus:bg-surfaceHighlight/20"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
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
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
