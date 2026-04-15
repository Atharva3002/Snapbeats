const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role:  { type: String, enum: ["user", "creator", "admin"], default: "user" },
    avatar: { type: String, default: "" },

    // Social
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Preferences
    moodPreferences: [{ type: String }],

    // Subscription
    subscriptionStatus: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },

    // Creator-specific
    bio:           { type: String, default: "" },
    totalPlays:    { type: Number, default: 0 },
    totalFollowers:{ type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Never expose passwordHash
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
