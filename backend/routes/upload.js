const express = require("express");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const multer = require("multer");

const router = express.Router();

// ---------- IMAGE UPLOAD (existing) ----------

router.post("/course-image", auth, requireAdmin, async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: "imageData is required" });
    }

    // Accept data URLs like "data:image/png;base64,..." or raw base64 strings.
    let base64String = imageData;
    let extension = "png";

    const dataUrlMatch =
      /^data:(image\/(png|jpe?g|gif|webp));base64,(.+)$/i.exec(imageData);
    if (dataUrlMatch) {
      extension = dataUrlMatch[2] === "jpeg" ? "jpg" : dataUrlMatch[2];
      base64String = dataUrlMatch[3];
    }

    const buffer = Buffer.from(base64String, "base64");
    const uploadDir = path.join(__dirname, "..", "uploads", "courses");
    fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.${extension}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicPath = `/uploads/courses/${fileName}`;
    const absoluteUrl = `${req.protocol}://${req.get("host")}${publicPath}`;

    res.json({ url: absoluteUrl, path: publicPath });
  } catch (err) {
    console.error("Image upload failed", err);
    res.status(500).json({ error: "Image upload failed" });
  }
});

// ---------- VIDEO UPLOAD (new) ----------

const videoUploadDir = path.join(__dirname, "..", "uploads", "videos");
fs.mkdirSync(videoUploadDir, { recursive: true });

const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, videoUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".mp4";
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9\-]/gi, "_")
      .slice(0, 60);
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${ext}`
    );
  },
});

const allowedVideoTypes = ["video/mp4", "video/webm"];

function videoFileFilter(req, file, cb) {
  if (allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only MP4 and WebM video files are allowed"));
  }
}

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: videoFileFilter,
});

// POST /api/uploads/course-video
// field name: `video`
router.post("/course-video", auth, requireAdmin, (req, res) => {
  uploadVideo.single("video")(req, res, (err) => {
    if (err) {
      console.error("Video upload failed", err);
      let message = err.message || "Video upload failed";
      if (message.includes("File too large")) {
        message = "Video too large (max 500MB)";
      }
      return res.status(400).json({ error: message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const publicPath = `/uploads/videos/${req.file.filename}`;
    const absoluteUrl = `${req.protocol}://${req.get("host")}${publicPath}`;

    return res.json({ url: absoluteUrl, path: publicPath });
  });
});

// ---------- PDF UPLOAD (new) ----------

const pdfUploadDir = path.join(__dirname, "..", "uploads", "pdfs");
fs.mkdirSync(pdfUploadDir, { recursive: true });

const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pdfUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".pdf";
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9\-]/gi, "_")
      .slice(0, 60);
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${ext}`
    );
  },
});

function pdfFileFilter(req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
}

const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: pdfFileFilter,
});

// POST /api/uploads/course-pdf
router.post("/course-pdf", auth, requireAdmin, (req, res) => {
  uploadPdf.single("file")(req, res, (err) => {
    if (err) {
      console.error("PDF upload failed", err);
      return res.status(400).json({ error: err.message || "PDF upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const publicPath = `/uploads/pdfs/${req.file.filename}`;
    const absoluteUrl = `${req.protocol}://${req.get("host")}${publicPath}`;

    return res.json({ url: absoluteUrl, path: publicPath });
  });
});

module.exports = router;