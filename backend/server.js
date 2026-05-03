require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();

// CORS configuration
const clientUrl = process.env.CLIENT_URL || "https://mern-elearn-frontend.onrender.com";
const allowedOrigins = [clientUrl, "http://localhost:3001", "http://localhost:3002"];

app.use(cors({
	origin: (origin, callback) => {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		if (allowedOrigins.indexOf(origin) === -1) {
			const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
			return callback(new Error(msg), false);
		}
		return callback(null, true);
	},
	credentials: true
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// static uploads (for course images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// connect mongo
mongoose
	.connect(process.env.MONGO_URI || "mongodb://localhost:27017/elearndb")
	.then(async () => {
		console.log("MongoDB connected");
		await ensureAdminUser();
	})
	.catch((err) => console.error("Mongo error", err));

// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/course"));
app.use("/api/purchases", require("./routes/purchase"));
app.use("/api/users", require("./routes/users"));
app.use("/api/uploads", require("./routes/upload"));
app.use("/api/feedback", require("./routes/feedback"));

// basic health
app.get("/", (req, res) => res.send("MERN eLearn backend running"));

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

async function ensureAdminUser() {
	try {
		const adminEmail = process.env.ADMIN_EMAIL;
		const adminPassword = process.env.ADMIN_PASSWORD;
		if (!adminEmail || !adminPassword) {
			return;
		}
		let user = await User.findOne({ email: adminEmail });
		if (user) {
			let changed = false;
			if (user.role !== "admin") {
				user.role = "admin";
				changed = true;
			}
			if (user.isEmailVerified === false) {
				user.isEmailVerified = true;
				changed = true;
			}
			// REMOVED: Do not overwrite password on restart if user exists
			// const samePassword = (adminPassword === user.password);
			// if (!samePassword) {
			// 	user.password = adminPassword;
			// 	changed = true;
			// }
			if (changed) {
				await user.save();
			}
			return;
		}
		const hashed = adminPassword;
		await User.create({
			name: "Admin",
			email: adminEmail,
			password: hashed,
			role: "admin",
			isEmailVerified: true,
		});
		console.log(`Seeded admin user ${adminEmail}`);
	} catch (err) {
		console.error("Failed to ensure admin user", err);
	}
}
