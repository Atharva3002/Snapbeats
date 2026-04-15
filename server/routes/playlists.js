const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/playlists");
const { protect } = require("../middleware/auth");

router.post("/",                          protect, ctrl.createPlaylist);
router.get("/my",                         protect, ctrl.getMyPlaylists);
router.post("/:id/add",                   protect, ctrl.addSnippet);
router.delete("/:id/remove/:snippetId",   protect, ctrl.removeSnippet);
router.delete("/:id",                     protect, ctrl.deletePlaylist);

module.exports = router;
