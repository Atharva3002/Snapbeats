import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadSnippetAPI } from "../../api/snippets";
import { MOOD_TAGS } from "../../utils/helpers";
import toast from "react-hot-toast";
import styles from "./Upload.module.css";

const MAX_SIZE_MB  = 100;
const MIN_DUR_SECS = 15;
const MAX_DUR_SECS = 60;

const Upload = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", durationSecs: "", moodTags: [],
  });
  const [videoFile,  setVideoFile]  = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [dragOver,   setDragOver]   = useState(false);
  const fileInputRef = useRef(null);
  const videoPreviewRef = useRef(null);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const toggleMood = (m) =>
    setForm((p) => ({
      ...p,
      moodTags: p.moodTags.includes(m)
        ? p.moodTags.filter((t) => t !== m)
        : [...p.moodTags, m],
    }));

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast.error("Only video files are allowed"); return; }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { toast.error(`Max file size is ${MAX_SIZE_MB}MB`); return; }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleVideoLoaded = () => {
    const v = videoPreviewRef.current;
    if (!v) return;
    const dur = Math.round(v.duration);
    setForm((p) => ({ ...p, durationSecs: String(dur) }));
  };

  const validate = () => {
    if (!videoFile)        { toast.error("Please select a video file"); return false; }
    if (!form.title.trim()){ toast.error("Title is required"); return false; }
    const dur = Number(form.durationSecs);
    if (!dur || dur < MIN_DUR_SECS || dur > MAX_DUR_SECS) {
      toast.error(`Duration must be ${MIN_DUR_SECS}–${MAX_DUR_SECS} seconds`); return false;
    }
    if (form.moodTags.length === 0) { toast.error("Select at least one mood tag"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setUploading(true); setProgress(0);

    const fd = new FormData();
    fd.append("video",       videoFile);
    fd.append("title",       form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("durationSecs",form.durationSecs);
    fd.append("moodTags",    form.moodTags.join(","));

    try {
      // Simulate upload progress (real progress needs XMLHttpRequest)
      const interval = setInterval(() => {
        setProgress((p) => { if (p >= 85) { clearInterval(interval); return p; } return p + 5; });
      }, 300);

      await uploadSnippetAPI(fd);
      clearInterval(interval);
      setProgress(100);

      toast.success("Snippet uploaded! Pending admin approval.");
      setTimeout(() => navigate("/creator"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const dur = Number(form.durationSecs);
  const durValid = dur >= MIN_DUR_SECS && dur <= MAX_DUR_SECS;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Upload Snippet</h1>
        <p className={styles.pageSub}>Upload a 15–60 second music video clip. It will go live after admin approval.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Drop zone */}
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dragOver : ""} ${videoFile ? styles.hasFile : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !videoFile && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            style={{ display: "none" }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />

          {videoFile ? (
            <div className={styles.videoPreviewWrap}>
              <video
                ref={videoPreviewRef}
                src={videoPreview}
                className={styles.videoPreview}
                controls
                onLoadedMetadata={handleVideoLoaded}
              />
              <div className={styles.fileInfo}>
                <p className={styles.fileName}>{videoFile.name}</p>
                <p className={styles.fileSize}>{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                {form.durationSecs && (
                  <span className={`badge ${durValid ? "badge-success" : "badge-danger"}`}>
                    {form.durationSecs}s {durValid ? "✓" : `— must be ${MIN_DUR_SECS}–${MAX_DUR_SECS}s`}
                  </span>
                )}
              </div>
              <button
                type="button"
                className={styles.changeFile}
                onClick={(e) => { e.stopPropagation(); setVideoFile(null); setVideoPreview(null); setForm((p) => ({ ...p, durationSecs: "" })); }}
              >
                Change file
              </button>
            </div>
          ) : (
            <div className={styles.dropPrompt}>
              <span className={styles.dropIcon}>⬆</span>
              <p className={styles.dropText}>Drag & drop your video here</p>
              <p className={styles.dropSub}>or click to browse · MP4, MOV, WebM · max {MAX_SIZE_MB}MB</p>
              <p className={styles.dropRule}>Duration: {MIN_DUR_SECS}–{MAX_DUR_SECS} seconds</p>
            </div>
          )}
        </div>

        <div className={styles.fields}>
          {/* Left column */}
          <div className={styles.leftFields}>
            <div className={styles.field}>
              <label className={styles.label}>Title <span className={styles.required}>*</span></label>
              <input
                className="input"
                name="title"
                placeholder="Give your snippet a catchy title"
                value={form.title}
                onChange={handleChange}
                maxLength={80}
              />
              <span className={styles.charCount}>{form.title.length}/80</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={`input ${styles.textarea}`}
                name="description"
                placeholder="Tell listeners what this snippet is about..."
                value={form.description}
                onChange={handleChange}
                maxLength={300}
                rows={4}
              />
              <span className={styles.charCount}>{form.description.length}/300</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Duration (seconds)
                {form.durationSecs && !durValid && (
                  <span className={styles.durationError}> — must be {MIN_DUR_SECS}–{MAX_DUR_SECS}s</span>
                )}
              </label>
              <input
                className="input"
                name="durationSecs"
                type="number"
                placeholder="Auto-detected from video"
                value={form.durationSecs}
                onChange={handleChange}
                min={MIN_DUR_SECS}
                max={MAX_DUR_SECS}
              />
              <p className={styles.hint}>Auto-filled when you upload a video. You can also enter manually.</p>
            </div>
          </div>

          {/* Right column — mood tags */}
          <div className={styles.rightFields}>
            <div className={styles.field}>
              <label className={styles.label}>
                Mood tags <span className={styles.required}>*</span>
                <span className={styles.tagCount}>  {form.moodTags.length} selected</span>
              </label>
              <div className={styles.moodGrid}>
                {MOOD_TAGS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`${styles.moodTag} ${form.moodTags.includes(m) ? styles.moodTagActive : ""}`}
                    onClick={() => toggleMood(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className={styles.hint}>Select all moods that fit your snippet.</p>
            </div>
          </div>
        </div>

        {/* Upload progress bar */}
        {uploading && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <p className={styles.progressText}>{progress < 100 ? `Uploading… ${progress}%` : "Processing…"}</p>
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/creator")} disabled={uploading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? <><span className="spinner" /> Uploading…</> : "Submit for review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Upload;
