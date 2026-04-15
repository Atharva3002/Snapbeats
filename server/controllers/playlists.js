const Playlist = require("../models/Playlist");
const Snippet  = require("../models/Snippet");

// POST /api/playlists
const createPlaylist = async (req, res) => {
  try {
    const { name, mood, isPublic } = req.body;
    if (!name) return res.status(400).json({ message: "Playlist name is required" });

    const playlist = await Playlist.create({
      userId: req.user._id,
      name,
      mood:     mood || "",
      isPublic: isPublic || false,
    });
    res.status(201).json({ playlist });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/playlists/my
const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id })
      .populate({ path: "snippetIds", select: "title thumbnailUrl durationSecs moodTags" });
    res.status(200).json({ playlists });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/playlists/:id/add
const addSnippet = async (req, res) => {
  try {
    const { snippetId } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    const snippet = await Snippet.findById(snippetId);
    if (!snippet || snippet.status !== "approved") {
      return res.status(404).json({ message: "Snippet not found" });
    }

    if (!playlist.snippetIds.includes(snippetId)) {
      playlist.snippetIds.push(snippetId);
      await playlist.save();
    }
    res.status(200).json({ playlist });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/playlists/:id/remove/:snippetId
const removeSnippet = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    playlist.snippetIds.pull(req.params.snippetId);
    await playlist.save();
    res.status(200).json({ playlist });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/playlists/:id
const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.status(200).json({ message: "Playlist deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createPlaylist, getMyPlaylists, addSnippet, removeSnippet, deletePlaylist };
