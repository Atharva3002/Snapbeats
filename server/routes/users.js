const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/users");
const { protect }    = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

router.get("/feed",     protect, ctrl.getFeed);
router.get("/:id",               ctrl.getProfile);
router.put("/me",       protect, uploadImage.single("avatar"), ctrl.updateProfile);
router.post("/:id/follow", protect, ctrl.followUser);

module.exports = router;
