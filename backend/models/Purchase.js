const mongoosePurchase = require("mongoose");

const purchaseSchema = new mongoosePurchase.Schema({
  user: {
    type: mongoosePurchase.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoosePurchase.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  status: { type: String, enum: ["pending", "success"], default: "pending" },
  stripeSessionId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoosePurchase.model("Purchase", purchaseSchema);
