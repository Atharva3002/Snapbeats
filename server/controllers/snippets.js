const Snippet   = require("../models/Snippet");
const User      = require("../models/User");
const { cloudinary } = require("../config/cloudinary");

// POST /api/snippets/upload  (creator only)
const uploadSnippet = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Video file is required" });
    }

    const { title, description, durationSecs, moodTags, thumbnailUrl } = req.body;

    const snippet = await Snippet.create({
      title,
      description,
      creatorId:     req.user._id,
      videoUrl:      req.file.path,
      videoPublicId: req.file.filename,
      thumbnailUrl:  thumbnailUrl || "",
      durationSecs:  Number(durationSecs),
      moodTags:      moodTags ? moodTags.split(",").map((t) => t.trim()) : [],
      status:        "pending",
    });

    res.status(201).json({ message: "Snippet uploaded, pending approval", snippet });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// GET /api/snippets  — browse approved snippets, filter by mood
const getSnippets = async (req, res) => {
  try {
    const { mood, page = 1, limit = 20 } = req.query;
    const query = { status: "approved" };
    if (mood) query.moodTags = { $in: [mood] };

    const snippets = await Snippet.find(query)
      .populate("creatorId", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Snippet.countDocuments(query);

    res.status(200).json({ snippets, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/snippets/:id
const getSnippetById = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate("creatorId", "name avatar bio");

    if (!snippet || snippet.status !== "approved") {
      return res.status(404).json({ message: "Snippet not found" });
    }

    // Increment play count
    snippet.plays += 1;
    await snippet.save();

    // Update creator total plays
    await User.findByIdAndUpdate(snippet.creatorId, { $inc: { totalPlays: 1 } });

    res.status(200).json({ snippet });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/snippets/:id/like  (toggle)
const likeSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet || snippet.status !== "approved") {
      return res.status(404).json({ message: "Snippet not found" });
    }

    const userId   = req.user._id;
    const alreadyLiked = snippet.likes.includes(userId);

    if (alreadyLiked) {
      snippet.likes.pull(userId);
    } else {
      snippet.likes.push(userId);
    }
    await snippet.save();

    res.status(200).json({
      liked:      !alreadyLiked,
      totalLikes: snippet.likes.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/snippets/creator/:creatorId
const getCreatorSnippets = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const snippets = await Snippet.find({
      creatorId: req.params.creatorId,
      status:    "approved",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ snippets });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/snippets/my  — creator sees their own snippets (all statuses)
const getMySnippets = async (req, res) => {
  try {
    const snippets = await Snippet.find({ creatorId: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ snippets });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/snippets/:id  — creator deletes their own
const deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: "Snippet not found" });

    if (snippet.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorised" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(snippet.videoPublicId, { resource_type: "video" });
    await snippet.deleteOne();

    res.status(200).json({ message: "Snippet deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  uploadSnippet,
  getSnippets,
  getSnippetById,
  likeSnippet,
  getCreatorSnippets,
  getMySnippets,
  deleteSnippet,
};
