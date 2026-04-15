const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan:          { type: String, enum: ["free", "premium_99", "premium_199"], required: true },
    startDate:     { type: Date, required: true },
    endDate:       { type: Date, required: true },
    paymentStatus: { type: String, enum: ["paid", "pending", "failed"], default: "pending" },
    amount:        { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
