const User    = require("../models/User");
const Snippet = require("../models/Snippet");

// GET /api/users/:id  — public profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name avatar bio role totalPlays totalFollowers moodPreferences createdAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/users/me  — update own profile
const updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "bio", "moodPreferences"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (req.file) updates.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/users/:id/follow  (toggle)
const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const target   = await User.findById(targetId);
    if (!target || target.role !== "creator") {
      return res.status(404).json({ message: "Creator not found" });
    }

    const me = await User.findById(req.user._id);
    const alreadyFollowing = me.following.includes(targetId);

    if (alreadyFollowing) {
      me.following.pull(targetId);
      target.followers.pull(req.user._id);
      target.totalFollowers = Math.max(0, target.totalFollowers - 1);
    } else {
      me.following.push(targetId);
      target.followers.push(req.user._id);
      target.totalFollowers += 1;
    }

    await Promise.all([me.save(), target.save()]);
    res.status(200).json({ following: !alreadyFollowing, totalFollowers: target.totalFollowers });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/users/feed  — snippets from followed creators
const getFeed = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select("following");
    const { page = 1, limit = 20 } = req.query;

    const snippets = await Snippet.find({
      creatorId: { $in: me.following },
      status: "approved",
    })
      .populate("creatorId", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ snippets });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getProfile, updateProfile, followUser, getFeed };
