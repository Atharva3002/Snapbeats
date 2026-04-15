const express  = require("express");
const router   = express.Router();
const ctrl     = require("../controllers/snippets");
const { protect }                  = require("../middleware/auth");
const { rbac }                     = require("../middleware/rbac");
const { uploadVideo }              = require("../middleware/upload");
const { validateSnippetDuration }  = require("../middleware/validate");

// Public
router.get("/",                       getSnippets_public);
router.get("/creator/:creatorId",     ctrl.getCreatorSnippets);
router.get("/:id",                    ctrl.getSnippetById);

// Authenticated users
router.post("/:id/like", protect, ctrl.likeSnippet);

// Creators only
router.post(
  "/upload",
  protect,
  rbac("creator"),
  uploadVideo.single("video"),
  validateSnippetDuration,
  ctrl.uploadSnippet
);
router.get("/my/snippets", protect, rbac("creator"), ctrl.getMySnippets);
router.delete("/:id",      protect, rbac("creator"), ctrl.deleteSnippet);

function getSnippets_public(req, res) { return ctrl.getSnippets(req, res); }

module.exports = router;
