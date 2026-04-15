import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { getSnippetByIdAPI, likeSnippetAPI } from "../../api/snippets";
import { getCommentsAPI, addCommentAPI, deleteCommentAPI, reportSnippetAPI } from "../../api/comments";
import { followUserAPI } from "../../api/users";
import { getMyPlaylistsAPI, addToPlaylistAPI } from "../../api/playlists";
import { useAuth } from "../../hooks/useAuth";
import { formatDuration, formatCount } from "../../utils/helpers";
import toast from "react-hot-toast";
import styles from "./Player.module.css";

const Player = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const videoRef  = useRef(null);

  const [snippet,    setSnippet]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [playing,    setPlaying]    = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [volume,     setVolume]     = useState(1);
  const [muted,      setMuted]      = useState(false);
  const [liked,      setLiked]      = useState(false);
  const [likeCount,  setLikeCount]  = useState(0);
  const [following,  setFollowing]  = useState(false);
  const [comments,   setComments]   = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [playlists,  setPlaylists]  = useState([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [reportOpen, setReportOpen]    = useState(false);
  const [reportReason, setReportReason] = useState("inappropriate");

  // Load snippet
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getSnippetByIdAPI(id);
        setSnippet(data.snippet);
        setLiked(data.snippet.likes?.includes(user?._id));
        setLikeCount(data.snippet.likes?.length ?? 0);
      } catch {
        toast.error("Snippet not found");
        navigate("/browse");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Load comments
  useEffect(() => {
    getCommentsAPI(id).then(({ data }) => setComments(data.comments || [])).catch(() => {});
  }, [id]);

  // Load playlists for current user
  useEffect(() => {
    if (user) {
      getMyPlaylistsAPI().then(({ data }) => setPlaylists(data.playlists || [])).catch(() => {});
    }
  }, [user]);

  // Video event sync
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTimeUpdate = () => setProgress((v.currentTime / v.duration) * 100 || 0);
    const onEnded      = () => setPlaying(false);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended",      onEnded);
    return () => { v.removeEventListener("timeupdate", onTimeUpdate); v.removeEventListener("ended", onEnded); };
  }, [snippet]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else         { v.play();  setPlaying(true);  }
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  const handleVolume = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setMuted(val === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    setMuted(next);
    v.muted = next;
  };

  const handleLike = async () => {
    if (!user) { toast.error("Sign in to like"); return; }
    try {
      const { data } = await likeSnippetAPI(id);
      setLiked(data.liked);
      setLikeCount(data.totalLikes);
    } catch { toast.error("Could not update like"); }
  };

  const handleFollow = async () => {
    if (!user) { toast.error("Sign in to follow"); return; }
    try {
      await followUserAPI(snippet.creatorId._id);
      setFollowing((f) => !f);
      toast.success(following ? "Unfollowed" : "Following!");
    } catch { toast.error("Could not update follow"); }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addToPlaylistAPI(playlistId, { snippetId: id });
      toast.success("Added to playlist");
      setShowPlaylist(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) { toast.error("Sign in to comment"); return; }
    setSubmitting(true);
    try {
      const { data } = await addCommentAPI(id, { text: newComment });
      setComments((prev) => [data.comment, ...prev]);
      setNewComment("");
    } catch { toast.error("Could not post comment"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (cid) => {
    try {
      await deleteCommentAPI(cid);
      setComments((prev) => prev.filter((c) => c._id !== cid));
      toast.success("Comment deleted");
    } catch { toast.error("Could not delete"); }
  };

  const handleReport = async () => {
    try {
      await reportSnippetAPI(id, { reason: reportReason });
      toast.success("Report submitted");
      setReportOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit report");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingWrap}><div className="spinner" style={{ width:36, height:36 }} /></div>
      </div>
    );
  }
  if (!snippet) return null;

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.layout}>

        {/* ── Video Panel ── */}
        <div className={styles.videoPanel}>
          <div className={styles.videoWrap}>
            <video
              ref={videoRef}
              src={snippet.videoUrl}
              className={styles.video}
              onClick={togglePlay}
              playsInline
            />
            {!playing && (
              <div className={styles.playOverlay} onClick={togglePlay}>
                <span className={styles.bigPlay}>▶</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.progressBar} onClick={handleSeek}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.controlRow}>
              <div className={styles.leftControls}>
                <button className={styles.controlBtn} onClick={togglePlay}>
                  {playing ? "⏸" : "▶"}
                </button>
                <button className={styles.controlBtn} onClick={toggleMute}>
                  {muted || volume === 0 ? "🔇" : "🔊"}
                </button>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolume}
                  className={styles.volumeSlider}
                />
              </div>
              <span className={styles.duration}>{formatDuration(snippet.durationSecs)}</span>
            </div>
          </div>

          {/* Info */}
          <div className={styles.infoBlock}>
            <div className={styles.titleRow}>
              <h1 className={styles.snippetTitle}>{snippet.title}</h1>
              <div className={styles.actions}>
                <button
                  className={`${styles.actionBtn} ${liked ? styles.liked : ""}`}
                  onClick={handleLike}
                  title="Like"
                >
                  {liked ? "♥" : "♡"} {formatCount(likeCount)}
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => setShowPlaylist((v) => !v)}
                  title="Save to playlist"
                >
                  + Save
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.danger}`}
                  onClick={() => setReportOpen((v) => !v)}
                  title="Report"
                >
                  ⚑ Report
                </button>
              </div>
            </div>

            <div className={styles.tags}>
              {snippet.moodTags?.map((t) => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>

            {snippet.description && (
              <p className={styles.desc}>{snippet.description}</p>
            )}

            {/* Creator info */}
            <div className={styles.creatorRow}>
              <div
                className={styles.creatorInfo}
                onClick={() => navigate(`/profile/${snippet.creatorId._id}`)}
              >
                <div className={styles.creatorAvatar}>
                  {snippet.creatorId.avatar
                    ? <img src={snippet.creatorId.avatar} alt="" />
                    : <span>{snippet.creatorId.name?.[0]?.toUpperCase()}</span>}
                </div>
                <div>
                  <p className={styles.creatorName}>{snippet.creatorId.name}</p>
                  {snippet.creatorId.bio && (
                    <p className={styles.creatorBio}>{snippet.creatorId.bio}</p>
                  )}
                </div>
              </div>
              {user?._id !== snippet.creatorId._id && (
                <button
                  className={`btn ${following ? "btn-ghost" : "btn-primary"}`}
                  style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                  onClick={handleFollow}
                >
                  {following ? "Following" : "Follow"}
                </button>
              )}
            </div>

            <p className={styles.plays}>▶ {formatCount(snippet.plays)} plays</p>
          </div>

          {/* Playlist dropdown */}
          {showPlaylist && (
            <div className={styles.playlistDrop}>
              <p className={styles.dropTitle}>Save to playlist</p>
              {playlists.length === 0
                ? <p className={styles.dropEmpty}>No playlists yet. Create one in your profile.</p>
                : playlists.map((pl) => (
                    <button key={pl._id} className={styles.dropItem} onClick={() => handleAddToPlaylist(pl._id)}>
                      {pl.name}
                    </button>
                  ))
              }
            </div>
          )}

          {/* Report modal */}
          {reportOpen && (
            <div className={styles.reportBox}>
              <p className={styles.dropTitle}>Report snippet</p>
              <select
                className="input"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                style={{ marginBottom: 12 }}
              >
                {["inappropriate","copyright","spam","other"].map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-danger" style={{ flex:1 }} onClick={handleReport}>Submit</button>
                <button className="btn btn-ghost"  style={{ flex:1 }} onClick={() => setReportOpen(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Comments Panel ── */}
        <div className={styles.commentsPanel}>
          <h2 className={styles.commentsTitle}>Comments</h2>

          {user && (
            <form onSubmit={handleComment} className={styles.commentForm}>
              <input
                className="input"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: "10px 20px" }}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? <span className="spinner" /> : "Post"}
              </button>
            </form>
          )}

          <div className={styles.commentsList}>
            {comments.length === 0
              ? <p className={styles.noComments}>No comments yet. Be the first!</p>
              : comments.map((c) => (
                  <div key={c._id} className={styles.comment}>
                    <div className={styles.commentAvatar}>
                      {c.userId?.avatar
                        ? <img src={c.userId.avatar} alt="" />
                        : <span>{c.userId?.name?.[0]?.toUpperCase()}</span>}
                    </div>
                    <div className={styles.commentBody}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>{c.userId?.name}</span>
                        <span className={styles.commentTime}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={styles.commentText}>{c.text}</p>
                    </div>
                    {(user?._id === c.userId?._id || user?.role === "admin") && (
                      <button
                        className={styles.deleteComment}
                        onClick={() => handleDeleteComment(c._id)}
                        title="Delete"
                      >✕</button>
                    )}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
