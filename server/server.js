require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

// Connect MongoDB
connectDB();

// Rate limiter — global (100 req / 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later" },
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api", limiter);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/snippets", require("./routes/snippets"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/playlists", require("./routes/playlists"));
app.use("/api/comments", require("./routes/comments"));

// Health check
app.get("/api/health", (req, res) =>
  res.status(200).json({ status: "ok", env: process.env.NODE_ENV }),
);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SnapBeats server running on port ${PORT}`));
