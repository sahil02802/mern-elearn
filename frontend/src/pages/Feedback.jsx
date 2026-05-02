import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Send, AlertCircle } from "lucide-react";

import API from "../api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function Feedback({ embedded = false }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const courseId = state?.courseId;
  const courseTitle = state?.courseTitle;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating to continue");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await API.post("/feedback", { rating, comment, courseId });
      navigate(courseId ? `/courses/${courseId}` : "/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit feedback");
      setLoading(false);
    }
  };

  const getRatingLabel = (r) => {
    switch (r) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent!";
      default:
        return "";
    }
  };

  const containerClass = embedded
    ? "w-full flex justify-center p-4"
    : "flex min-h-screen items-center justify-center p-4 bg-canvas bg-[url('../assets/grid.svg')]";

  return (
    <div className={containerClass}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="p-8 border border-white/5 bg-surface/50 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mb-4 border border-brand-500/20">
              <MessageSquare className="text-brand-400" size={24} />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              {courseTitle ? `Rate ${courseTitle}` : "Share Your Experience"}
            </h1>
            <p className="text-ink-400">
              {courseTitle
                ? "How was the course? Your feedback helps others choose."
                : "We value your feedback! Rate your learning journey with Study Point."}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2 border border-red-500/10"
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                How would you rate us?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setRating((prev) => (prev === star ? 0 : star))
                    }
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none focus:ring-2 focus:ring-brand-500/50 rounded-full p-1"
                  >
                    <Star
                      size={40}
                      className={`transition-all duration-200 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                          : "fill-transparent text-ink-600 hover:text-ink-400"
                      }`}
                      strokeWidth={1.5}
                    />
                  </motion.button>
                ))}
              </div>
              <div className="h-6">
                <AnimatePresence mode="wait">
                  {(hoveredRating || rating) > 0 && (
                    <motion.p
                      key={hoveredRating || rating}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-sm font-semibold text-brand-400"
                    >
                      {getRatingLabel(hoveredRating || rating)}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink-300">
                Your Comments
              </label>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-canvas border border-white/10 p-4 text-sm text-white placeholder:text-ink-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all resize-none"
                placeholder="Tell us what you liked or how we can improve..."
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-12 text-base"
            >
              {!loading && <Send size={18} className="mr-2" />}
              Submit Feedback
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
