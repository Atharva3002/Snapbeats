const Comment = require("../models/Comment");
const Report  = require("../models/Report");

// GET /api/comments/:snippetId
const getComments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const comments = await Comment.find({ snippetId: req.params.snippetId })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ comments });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/comments/:snippetId
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const comment = await Comment.create({
      snippetId: req.params.snippetId,
      userId:    req.user._id,
      text,
    });

    const populated = await comment.populate("userId", "name avatar");
    res.status(201).json({ comment: populated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = comment.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorised" });
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/comments/report/:snippetId
const reportSnippet = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const existing = await Report.findOne({
      snippetId:  req.params.snippetId,
      reportedBy: req.user._id,
    });
    if (existing) return res.status(409).json({ message: "You already reported this snippet" });

    const report = await Report.create({
      snippetId:  req.params.snippetId,
      reportedBy: req.user._id,
      reason,
      details: details || "",
    });
    res.status(201).json({ message: "Report submitted", report });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getComments, addComment, deleteComment, reportSnippet };
