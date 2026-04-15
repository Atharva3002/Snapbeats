const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    snippetId:  { type: mongoose.Schema.Types.ObjectId, ref: "Snippet", required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
    reason:     {
      type: String,
      enum: ["inappropriate", "copyright", "spam", "other"],
      required: true,
    },
    details: { type: String, default: "" },
    status:  { type: String, enum: ["open", "reviewed", "dismissed"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
