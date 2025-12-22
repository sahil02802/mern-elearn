const expressPurchase = require("express");
const routerPurchase = expressPurchase.Router();
const Purchase = require("../models/Purchase");
const CourseModel = require("../models/Course");
const authPurchase = require("../middleware/auth");

// create purchase (pending)
routerPurchase.post("/", authPurchase, async (req, res) => {
	try {
		const { courseId } = req.body;
		const course = await CourseModel.findById(courseId);
		if (!course) return res.status(404).json({ error: "Course not found" });

		// prevent duplicate successful purchase
		const existing = await Purchase.findOne({
			user: req.user.id,
			course: courseId,
			status: "success",
		});
		if (existing) return res.status(400).json({ error: "purchased" });

		const p = await Purchase.create({
			user: req.user.id,
			course: courseId,
			status: "pending",
		});
		res.json({ purchaseId: p._id });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// confirm purchase (client calls after simulated delay)
routerPurchase.post("/confirm", authPurchase, async (req, res) => {
	try {
		const { purchaseId } = req.body;
		const p = await Purchase.findByIdAndUpdate(
			purchaseId,
			{ status: "success" },
			{ new: true }
		).populate("course");
		res.json(p);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// user purchases
routerPurchase.get("/me", authPurchase, async (req, res) => {
	try {
		const list = await Purchase.find({ user: req.user.id }).populate("course");
		res.json(list);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// admin: all purchases
routerPurchase.get("/", authPurchase, async (req, res) => {
	try {
		if (req.user.role !== "admin")
			return res.status(403).json({ error: "only admin" });
		const all = await Purchase.find().populate("user").populate("course");
		res.json(all);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
routerPurchase.post("/create-checkout-session", authPurchase, async (req, res) => {
	try {
		const { courseId } = req.body;
		const course = await CourseModel.findById(courseId);
		if (!course) return res.status(404).json({ error: "Course not found" });

		// Check if already purchased
		const existing = await Purchase.findOne({
			user: req.user.id,
			course: courseId,
			status: "success",
		});
		if (existing) return res.status(400).json({ error: "Already purchased" });

		// Create a pending purchase record
		let purchase = await Purchase.findOne({
			user: req.user.id,
			course: courseId,
			status: "pending",
		});

		if (!purchase) {
			purchase = await Purchase.create({
				user: req.user.id,
				course: courseId,
				status: "pending",
			});
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency: "inr",
						product_data: {
							name: course.title,
							description: course.description,
							images: course.imageUrl ? [course.imageUrl] : [],
						},
						unit_amount: course.price * 100, // Amount in paise
					},
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/courses/${courseId}`,
			metadata: {
				purchaseId: purchase._id.toString(),
				userId: req.user.id,
				courseId: courseId,
			},
		});

		// Update purchase with session ID
		purchase.stripeSessionId = session.id;
		await purchase.save();

		res.json({ url: session.url });
	} catch (err) {
		console.error("Stripe error:", err);
		res.status(500).json({ error: err.message });
	}
});

// Verify Stripe Session
routerPurchase.post("/verify-session", authPurchase, async (req, res) => {
	try {
		const { sessionId } = req.body;
		if (!sessionId) return res.status(400).json({ error: "Session ID required" });

		const session = await stripe.checkout.sessions.retrieve(sessionId);
		if (!session) return res.status(404).json({ error: "Session not found" });

		if (session.payment_status === "paid") {
			const purchaseId = session.metadata.purchaseId;
			const purchase = await Purchase.findByIdAndUpdate(
				purchaseId,
				{ status: "success" },
				{ new: true }
			).populate("course");
			return res.json({ success: true, purchase });
		} else {
			return res.json({ success: false, status: session.payment_status });
		}
	} catch (err) {
		console.error("Verification error:", err);
		res.status(500).json({ error: err.message });
	}
});

module.exports = routerPurchase;
