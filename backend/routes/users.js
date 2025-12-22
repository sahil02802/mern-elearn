const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

router.use(auth, requireAdmin);

router.get("/", async (req, res) => {
	try {
		const users = await User.find().select("-password");
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.post("/", async (req, res) => {
	try {
		const { name, email, password, role = "user" } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}
		// User creation
		const existing = await User.findOne({ email });
		if (existing)
			return res.status(400).json({ error: "Email already exists" });

		// REMOVED ENCRYPTION AS PER REQUEST - STORE PLAIN TEXT
		const user = await User.create({ name, email, password, role });
		res.json({
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			avatar: user.avatar,
			createdAt: user.createdAt,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.put("/:id", async (req, res) => {
	try {
		const updates = { ...req.body };
		// REMOVED ENCRYPTION FOR UPDATES
		// if (updates.password) {
		// 	updates.password = await bcrypt.hash(updates.password, 10);
		// }
		const user = await User.findByIdAndUpdate(req.params.id, updates, {
			new: true,
		}).select("-password");
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		await User.findByIdAndDelete(req.params.id);
		res.json({ msg: "deleted" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
