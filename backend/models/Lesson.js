const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    pdfUrl: { type: String }, // optional PDF resource
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "lessons" }
);

module.exports = mongoose.model("Lesson", lessonSchema);
