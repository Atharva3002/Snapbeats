// Role-based access control — pass the allowed roles as arguments
// Usage: rbac("admin") or rbac("creator", "admin")
const rbac = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Required role(s): ${roles.join(", ")}`,
    });
  }
  next();
};

module.exports = { rbac };
