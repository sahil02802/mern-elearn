const mongooseCourse = require("mongoose");

const courseSchema = new mongooseCourse.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  duration: String, // e.g., '2h', '10h'
  tech: String,
  createdAt: { type: Date, default: Date.now },
  videoUrl: String, // existing single-video field, kept for compatibility
  imageUrl: String,
});

module.exports = mongooseCourse.model("Course", courseSchema);
