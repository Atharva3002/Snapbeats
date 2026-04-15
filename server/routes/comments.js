const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/comments");
const { protect } = require("../middleware/auth");

router.get("/:snippetId",         ctrl.getComments);
router.post("/:snippetId",        protect, ctrl.addComment);
router.delete("/:id",             protect, ctrl.deleteComment);
router.post("/report/:snippetId", protect, ctrl.reportSnippet);

module.exports = router;
