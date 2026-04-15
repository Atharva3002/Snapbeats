// Backend duration validation — the single source of truth for snippet length
const validateSnippetDuration = (req, res, next) => {
  const MIN = parseInt(process.env.MIN_SNIPPET_DURATION) || 15;
  const MAX = parseInt(process.env.MAX_SNIPPET_DURATION) || 60;

  const { durationSecs } = req.body;

  if (durationSecs === undefined || durationSecs === null) {
    return res.status(400).json({ message: "durationSecs is required" });
  }

  const dur = Number(durationSecs);

  if (isNaN(dur)) {
    return res.status(400).json({ message: "durationSecs must be a number" });
  }

  if (dur < MIN || dur > MAX) {
    return res.status(400).json({
      message: `Snippet duration must be between ${MIN} and ${MAX} seconds. Got: ${dur}s`,
    });
  }

  next();
};

// Generic required fields checker
const requireFields = (...fields) => (req, res, next) => {
  const missing = fields.filter((f) => !req.body[f] && req.body[f] !== 0);
  if (missing.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }
  next();
};

module.exports = { validateSnippetDuration, requireFields };
