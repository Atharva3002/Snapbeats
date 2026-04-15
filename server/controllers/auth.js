const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
  return { accessToken, refreshToken };
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Only allow user or creator on self-registration; admin created manually
    const allowedRoles = ["user", "creator"];
    const assignedRole = allowedRoles.includes(role) ? role : "user";

    const user = await User.create({
      name,
      email,
      passwordHash: password, // pre-save hook hashes it
      role: assignedRole,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(201).json({
      message: "Registered successfully",
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(200).json({
      message: "Logged in successfully",
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const tokens = generateTokens(user._id);
    res.status(200).json(tokens);
  } catch (err) {
    res.status(401).json({ message: "Refresh token invalid or expired" });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = { register, login, refresh, getMe };
