import { useState, useEffect } from "react";
import { getAdminSnippetsAPI, moderateSnippetAPI, getAdminReportsAPI, updateReportAPI } from "../../api/admin";
import { formatDuration } from "../../utils/helpers";
import toast from "react-hot-toast";
import styles from "./Moderation.module.css";

const TABS = ["Snippets", "Reports"];

const Moderation = () => {
  const [tab,      setTab]      = useState("Snippets");
  const [snippets, setSnippets] = useState([]);
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    setLoading(true);
    if (tab === "Snippets") {
      getAdminSnippetsAPI({ status: statusFilter, limit: 50 })
        .then(({ data }) => setSnippets(data.snippets || []))
        .catch(() => toast.error("Could not load snippets"))
        .finally(() => setLoading(false));
    } else {
      getAdminReportsAPI({ status: "open", limit: 50 })
        .then(({ data }) => setReports(data.reports || []))
        .catch(() => toast.error("Could not load reports"))
        .finally(() => setLoading(false));
    }
  }, [tab, statusFilter]);

  const handleApprove = async (id) => {
    setActing(id);
    try {
      await moderateSnippetAPI(id, { action: "approve" });
      setSnippets((prev) => prev.filter((s) => s._id !== id));
      toast.success("Snippet approved ✓");
    } catch { toast.error("Action failed"); }
    finally   { setActing(null); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error("Please enter a rejection reason"); return; }
    setActing(rejectId);
    try {
      await moderateSnippetAPI(rejectId, { action: "reject", rejectionReason: rejectReason });
      setSnippets((prev) => prev.filter((s) => s._id !== rejectId));
      toast.success("Snippet rejected");
      setRejectId(null);
      setRejectReason("");
    } catch { toast.error("Action failed"); }
    finally   { setActing(null); }
  };

  const handleDismissReport = async (id) => {
    setActing(id);
    try {
      await updateReportAPI(id, { status: "dismissed" });
      setReports((prev) => prev.filter((r) => r._id !== id));
      toast.success("Report dismissed");
    } catch { toast.error("Action failed"); }
    finally   { setActing(null); }
  };

  const handleReviewedReport = async (id) => {
    setActing(id);
    try {
      await updateReportAPI(id, { status: "reviewed" });
      setReports((prev) => prev.filter((r) => r._id !== id));
      toast.success("Marked as reviewed");
    } catch { toast.error("Action failed"); }
    finally   { setActing(null); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Moderation</h1>
        <p className={styles.pageSub}>Review uploaded snippets and handle user reports</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "Snippets" && <span className={styles.tabBadge}>{snippets.length}</span>}
            {t === "Reports"  && <span className={styles.tabBadge}>{reports.length}</span>}
          </button>
        ))}
      </div>

      {/* Snippet status filter */}
      {tab === "Snippets" && (
        <div className={styles.filterRow}>
          {["pending","approved","rejected"].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${statusFilter === f ? styles.filterActive : ""}`}
              onClick={() => setStatusFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className={styles.loadingRows}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className={styles.skeletonRow} />)}
        </div>
      ) : tab === "Snippets" ? (
        snippets.length === 0 ? (
          <div className={styles.empty}>
            <span>✓</span>
            <p>No {statusFilter} snippets — queue is clear!</p>
          </div>
        ) : (
          <div className={styles.cards}>
            {snippets.map((s) => (
              <div key={s._id} className={styles.snippetCard}>
                <div className={styles.cardThumb}>
                  {s.thumbnailUrl
                    ? <img src={s.thumbnailUrl} alt="" />
                    : <div className={styles.thumbPlaceholder}><span>♪</span></div>}
                  <span className={styles.cardDuration}>{formatDuration(s.durationSecs)}</span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <div>
                      <h3 className={styles.cardTitle}>{s.title}</h3>
                      <p className={styles.cardMeta}>
                        by <strong>{s.creatorId?.name}</strong> · {s.creatorId?.email}
                      </p>
                      {s.description && (
                        <p className={styles.cardDesc}>{s.description}</p>
                      )}
                      <div className={styles.cardTags}>
                        {s.moodTags?.map((t) => (
                          <span key={t} className={styles.tag}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.cardDate}>
                      {new Date(s.createdAt).toLocaleDateString("en-IN", {
                        day:"numeric", month:"short", year:"numeric"
                      })}
                    </div>
                  </div>

                  {s.videoUrl && (
                    <video
                      src={s.videoUrl}
                      controls
                      className={styles.cardVideo}
                      preload="metadata"
                    />
                  )}

                  {s.status === "rejected" && s.rejectionReason && (
                    <div className={styles.rejectionNote}>
                      <span className={styles.rejLabel}>Rejection reason:</span> {s.rejectionReason}
                    </div>
                  )}

                  {s.status === "pending" && (
                    <div className={styles.cardActions}>
                      <button
                        className="btn btn-primary"
                        style={{ flex:1 }}
                        onClick={() => handleApprove(s._id)}
                        disabled={acting === s._id}
                      >
                        {acting === s._id ? <span className="spinner" /> : "✓ Approve"}
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ flex:1 }}
                        onClick={() => { setRejectId(s._id); setRejectReason(""); }}
                        disabled={acting === s._id}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Reports tab */
        reports.length === 0 ? (
          <div className={styles.empty}><span>✓</span><p>No open reports!</p></div>
        ) : (
          <div className={styles.cards}>
            {reports.map((r) => (
              <div key={r._id} className={styles.reportCard}>
                <div className={styles.reportTop}>
                  <div className={styles.reportInfo}>
                    <span className="badge badge-danger">{r.reason}</span>
                    <p className={styles.reportSnippet}>
                      Snippet: <strong>{r.snippetId?.title || "Unknown"}</strong>
                    </p>
                    <p className={styles.reportBy}>
                      Reported by <strong>{r.reportedBy?.name}</strong> · {r.reportedBy?.email}
                    </p>
                    {r.details && <p className={styles.reportDetails}>"{r.details}"</p>}
                    <p className={styles.reportDate}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    </p>
                  </div>
                </div>
                <div className={styles.reportActions}>
                  <button
                    className="btn btn-ghost"
                    style={{ flex:1, fontSize:"0.82rem" }}
                    onClick={() => handleDismissReport(r._id)}
                    disabled={acting === r._id}
                  >
                    Dismiss
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex:1, fontSize:"0.82rem" }}
                    onClick={() => handleReviewedReport(r._id)}
                    disabled={acting === r._id}
                  >
                    {acting === r._id ? <span className="spinner" /> : "Mark reviewed"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className={styles.modalOverlay} onClick={() => setRejectId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Reject snippet</h2>
            <p className={styles.modalSub}>Provide a reason so the creator can improve their upload.</p>
            <textarea
              className={`input ${styles.rejectTextarea}`}
              placeholder="e.g. Duration exceeds 60 seconds, inappropriate content..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setRejectId(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                style={{ flex:1 }}
                onClick={handleReject}
                disabled={acting === rejectId || !rejectReason.trim()}
              >
                {acting === rejectId ? <span className="spinner" /> : "Confirm reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moderation;
