import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMySnippetsAPI, deleteSnippetAPI } from "../../api/snippets";
import { useAuth } from "../../hooks/useAuth";
import { formatDuration, formatCount } from "../../utils/helpers";
import toast from "react-hot-toast";
import styles from "./Dashboard.module.css";

const STATUS_COLORS = {
  approved: "badge-success",
  pending:  "badge-warning",
  rejected: "badge-danger",
};

const Dashboard = () => {
  const { user }  = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [filter,   setFilter]   = useState("all");

  useEffect(() => {
    getMySnippetsAPI()
      .then(({ data }) => setSnippets(data.snippets || []))
      .catch(() => toast.error("Could not load snippets"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this snippet? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteSnippetAPI(id);
      setSnippets((prev) => prev.filter((s) => s._id !== id));
      toast.success("Snippet deleted");
    } catch { toast.error("Could not delete snippet"); }
    finally   { setDeleting(null); }
  };

  const filtered = filter === "all" ? snippets : snippets.filter((s) => s.status === filter);

  const stats = {
    total:    snippets.length,
    approved: snippets.filter((s) => s.status === "approved").length,
    pending:  snippets.filter((s) => s.status === "pending").length,
    plays:    snippets.reduce((a, s) => a + (s.plays || 0), 0),
    likes:    snippets.reduce((a, s) => a + (s.likes?.length || 0), 0),
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSub}>Welcome back, {user?.name?.split(" ")[0]} 👋</p>
        </div>
        <Link to="/creator/upload" className="btn btn-primary">
          + Upload snippet
        </Link>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        {[
          { label: "Total snippets",  val: stats.total    },
          { label: "Live (approved)", val: stats.approved },
          { label: "Pending review",  val: stats.pending  },
          { label: "Total plays",     val: formatCount(stats.plays) },
          { label: "Total likes",     val: formatCount(stats.likes) },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statVal}>{s.val}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow}>
        {["all", "approved", "pending", "rejected"].map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={styles.filterCount}>
              {f === "all" ? snippets.length : snippets.filter((s) => s.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Snippets table */}
      {loading ? (
        <div className={styles.loadingRows}>
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className={styles.skeletonRow} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🎵</span>
          <p>{filter === "all" ? "You haven't uploaded any snippets yet." : `No ${filter} snippets.`}</p>
          {filter === "all" && (
            <Link to="/creator/upload" className="btn btn-primary" style={{ marginTop: 8 }}>
              Upload your first snippet
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Snippet</span>
            <span>Duration</span>
            <span>Mood tags</span>
            <span>Plays</span>
            <span>Likes</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filtered.map((s) => (
            <div key={s._id} className={styles.tableRow}>
              <div className={styles.snippetCell}>
                <div className={styles.snippetThumb}>
                  {s.thumbnailUrl
                    ? <img src={s.thumbnailUrl} alt="" />
                    : <span>♪</span>}
                </div>
                <div className={styles.snippetMeta}>
                  <p className={styles.snippetTitle}>{s.title}</p>
                  <p className={styles.snippetDate}>
                    {new Date(s.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                  </p>
                </div>
              </div>

              <span className={styles.cell}>{formatDuration(s.durationSecs)}</span>

              <div className={styles.tagsCell}>
                {s.moodTags?.slice(0, 2).map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
                {s.moodTags?.length > 2 && <span className={styles.tagMore}>+{s.moodTags.length - 2}</span>}
              </div>

              <span className={styles.cell}>{formatCount(s.plays)}</span>
              <span className={styles.cell}>{formatCount(s.likes?.length || 0)}</span>

              <span className={styles.cell}>
                <span className={`badge ${STATUS_COLORS[s.status]}`}>{s.status}</span>
              </span>

              <div className={styles.actionsCell}>
                {s.status === "rejected" && s.rejectionReason && (
                  <span className={styles.rejectionHint} title={s.rejectionReason}>⚠ Reason</span>
                )}
                <button
                  className="btn btn-danger"
                  style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                  onClick={() => handleDelete(s._id)}
                  disabled={deleting === s._id}
                >
                  {deleting === s._id ? <span className="spinner" style={{ width:14, height:14 }} /> : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
