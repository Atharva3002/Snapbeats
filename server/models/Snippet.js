const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    creatorId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Cloudinary
    videoUrl:      { type: String, required: true },
    videoPublicId: { type: String, required: true },
    thumbnailUrl:  { type: String, default: "" },

    // Validated on backend: 15–60 seconds
    durationSecs: { type: Number, required: true, min: 15, max: 60 },

    moodTags: [{ type: String }],

    // Engagement
    plays: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Admin moderation
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for mood-based discovery
snippetSchema.index({ moodTags: 1, status: 1, createdAt: -1 });
snippetSchema.index({ creatorId: 1, status: 1 });

module.exports = mongoose.model("Snippet", snippetSchema);
