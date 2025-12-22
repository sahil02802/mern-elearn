const expressCourse = require("express");
const routerCourse = expressCourse.Router();
const Course = require("../models/Course");
const Feedback = require("../models/Feedback");
const Lesson = require("../models/Lesson");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

function formatDuration(totalSeconds) {
  if (!totalSeconds || !Number.isFinite(totalSeconds)) return "";
  const totalMinutes = Math.round(totalSeconds / 60);
  if (totalMinutes <= 0) return "";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

async function recalcCourseDuration(courseId) {
  if (!courseId) return;
  const lessons = await Lesson.find({ courseId });
  const totalSeconds = (lessons || []).reduce(
    (sum, lesson) => sum + (lesson.durationSeconds || 0),
    0
  );
  const formatted = formatDuration(totalSeconds);
  await Course.findByIdAndUpdate(courseId, { duration: formatted });
}

// public: list + filters
routerCourse.get("/", async (req, res) => {
  try {
    const { tech, minPrice, maxPrice, sort = "latest", duration } = req.query;
    let q = {};
    if (tech) q.tech = tech;
    if (duration) q.duration = duration;
    if (minPrice || maxPrice) {
      q.price = {};
      if (minPrice) q.price.$gte = Number(minPrice);
      if (maxPrice) q.price.$lte = Number(maxPrice);
    }
    let cursor = Course.find(q);
    if (sort === "latest") cursor = cursor.sort({ createdAt: -1 });
    if (sort === "old") cursor = cursor.sort({ createdAt: 1 });
    const courses = await cursor;

    // Attach average ratings
    const coursesWithRatings = await Promise.all(courses.map(async (course) => {
      const feedbacks = await Feedback.find({ course: course._id });
      const count = feedbacks.length;
      const avg = count > 0
        ? feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / count
        : 0;

      return {
        ...course.toObject(),
        averageRating: avg,
        ratingCount: count
      };
    }));

    res.json(coursesWithRatings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// admin create
routerCourse.post("/", auth, requireAdmin, async (req, res) => {
  try {
    if (req.body.price < 0) {
      return res.status(400).json({ error: "Price cannot be negative" });
    }
    const course = await Course.create(req.body);
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// admin update
routerCourse.put("/:id", auth, requireAdmin, async (req, res) => {
  try {
    if (req.body.price !== undefined && req.body.price < 0) {
      return res.status(400).json({ error: "Price cannot be negative" });
    }
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// admin delete
routerCourse.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- LESSONS (new) ---------

// Get lessons for a course (from Lesson collection)
routerCourse.get("/:id/lessons", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select("_id");
    if (!course) return res.status(404).json({ error: "Course not found" });

    const lessons = await Lesson.find({ courseId: req.params.id }).sort({
      order: 1,
      createdAt: 1,
    });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: create lesson
routerCourse.post("/:id/lessons", auth, requireAdmin, async (req, res) => {
  try {
    const { title, description, order, videoUrl, durationSeconds, pdfUrl } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ error: "title and videoUrl are required" });
    }

    const course = await Course.findById(req.params.id).select("_id");
    if (!course) return res.status(404).json({ error: "Course not found" });

    let nextOrder = order;
    if (typeof nextOrder !== "number") {
      const last = await Lesson.find({ courseId: req.params.id })
        .sort({ order: -1 })
        .limit(1);
      nextOrder = (last[0]?.order ?? 0) + 1;
    }

    const created = await Lesson.create({
      courseId: req.params.id,
      title,
      description: description || "",
      videoUrl,
      order: nextOrder,
      durationSeconds:
        typeof durationSeconds === "number" ? durationSeconds : 0,
      pdfUrl: pdfUrl || "",
    });

    await recalcCourseDuration(req.params.id);
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

routerCourse.put(
  "/:id/lessons/:lessonId",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.lessonId);
      if (!lesson || lesson.courseId.toString() !== req.params.id) {
        return res
          .status(404)
          .json({ error: "Lesson not found for this course" });
      }

      const { title, description, order, videoUrl, durationSeconds, pdfUrl } = req.body;
      if (title != null) lesson.title = title;
      if (description != null) lesson.description = description;
      if (videoUrl != null) lesson.videoUrl = videoUrl;
      if (order != null) lesson.order = order;
      if (durationSeconds != null)
        lesson.durationSeconds = Number(durationSeconds) || 0;
      if (pdfUrl !== undefined) lesson.pdfUrl = pdfUrl;

      await lesson.save();
      await recalcCourseDuration(req.params.id);
      res.json(lesson);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

routerCourse.delete(
  "/:id/lessons/:lessonId",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.lessonId);
      if (!lesson || lesson.courseId.toString() !== req.params.id) {
        return res
          .status(404)
          .json({ error: "Lesson not found for this course" });
      }

      await Lesson.findByIdAndDelete(req.params.lessonId);
      await recalcCourseDuration(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = routerCourse;
