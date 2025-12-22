const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

// Get all feedbacks (Public)
router.get("/", async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate("user", "name email avatar")
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create feedback (Authenticated User)
router.post("/", auth, async (req, res) => {
    try {
        const { rating, comment, courseId } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ error: "Rating and comment are required" });
        }

        // Optional: Check if user already submitted feedback? 
        // For now, let's allow multiple or maybe just one per user. 
        // Let's stick to simple create for now.

        const feedback = await Feedback.create({
            user: req.user.id,
            rating,
            comment,
            course: courseId || null
        });

        const populated = await Feedback.findById(feedback._id).populate("user", "name email avatar");
        res.json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete feedback (Admin only)
router.delete("/:id", auth, requireAdmin, async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ msg: "Feedback deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
