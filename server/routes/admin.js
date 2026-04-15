const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/admin");
const { protect } = require("../middleware/auth");
const { rbac }    = require("../middleware/rbac");

const adminOnly = [protect, rbac("admin")];

router.get("/stats",                  ...adminOnly, ctrl.getStats);
router.get("/snippets",               ...adminOnly, ctrl.listSnippets);
router.put("/snippets/:id/moderate",  ...adminOnly, ctrl.moderateSnippet);
router.get("/users",                  ...adminOnly, ctrl.listUsers);
router.put("/users/:id/toggle",       ...adminOnly, ctrl.toggleUser);
router.get("/reports",                ...adminOnly, ctrl.listReports);
router.put("/reports/:id",            ...adminOnly, ctrl.updateReport);

module.exports = router;
