const Snippet = require("../models/Snippet");
const User    = require("../models/User");
const Report  = require("../models/Report");

// GET /api/admin/snippets?status=pending
const listSnippets = async (req, res) => {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;
    const snippets = await Snippet.find({ status })
      .populate("creatorId", "name email")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Snippet.countDocuments({ status });
    res.status(200).json({ snippets, total });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/admin/snippets/:id/moderate
const moderateSnippet = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Action must be approve or reject" });
    }

    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: "Snippet not found" });

    snippet.status = action === "approve" ? "approved" : "rejected";
    if (action === "reject") snippet.rejectionReason = rejectionReason || "";
    await snippet.save();

    res.status(200).json({ message: `Snippet ${snippet.status}`, snippet });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/admin/users
const listUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.status(200).json({ users, total });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/admin/users/:id/toggle  — activate / deactivate
const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot deactivate admins" });

    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/admin/reports
const listReports = async (req, res) => {
  try {
    const { status = "open", page = 1, limit = 20 } = req.query;
    const reports = await Report.find({ status })
      .populate("snippetId", "title videoUrl")
      .populate("reportedBy", "name email")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Report.countDocuments({ status });
    res.status(200).json({ reports, total });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/admin/reports/:id
const updateReport = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json({ report });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalCreators, totalSnippets, pendingSnippets, openReports] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "creator" }),
        Snippet.countDocuments({ status: "approved" }),
        Snippet.countDocuments({ status: "pending" }),
        Report.countDocuments({ status: "open" }),
      ]);

    res.status(200).json({ totalUsers, totalCreators, totalSnippets, pendingSnippets, openReports });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { listSnippets, moderateSnippet, listUsers, toggleUser, listReports, updateReport, getStats };
