import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminStatsAPI, getAdminSnippetsAPI, getAdminReportsAPI } from "../../api/admin";
import { formatCount } from "../../utils/helpers";
import toast from "react-hot-toast";
import styles from "./Dashboard.module.css";

const AdminDashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [pending, setPending] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p, r] = await Promise.all([
          getAdminStatsAPI(),
          getAdminSnippetsAPI({ status: "pending", limit: 5 }),
          getAdminReportsAPI({ status: "open",    limit: 5 }),
        ]);
        setStats(s.data);
        setPending(p.data.snippets || []);
        setReports(r.data.reports  || []);
      } catch { toast.error("Could not load dashboard"); }
      finally   { setLoading(false); }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}><div className="spinner" style={{ width:36, height:36 }} /></div>
      </div>
    );
  }

  const kpis = [
    { label: "Total users",     val: formatCount(stats?.totalUsers    ?? 0), icon: "👤", color: "blue"   },
    { label: "Creators",        val: formatCount(stats?.totalCreators ?? 0), icon: "🎤", color: "purple" },
    { label: "Live snippets",   val: formatCount(stats?.totalSnippets ?? 0), icon: "▶",  color: "green"  },
    { label: "Pending review",  val: stats?.pendingSnippets ?? 0,            icon: "⏳", color: "amber"  },
    { label: "Open reports",    val: stats?.openReports     ?? 0,            icon: "⚑",  color: "red"    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Admin Dashboard</h1>
        <p className={styles.pageSub}>Platform overview at a glance</p>
      </div>

      {/* KPI row */}
      <div className={styles.kpiRow}>
        {kpis.map((k) => (
          <div key={k.label} className={`${styles.kpiCard} ${styles["kpi_" + k.color]}`}>
            <span className={styles.kpiIcon}>{k.icon}</span>
            <span className={styles.kpiVal}>{k.val}</span>
            <span className={styles.kpiLabel}>{k.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.panels}>
        {/* Pending snippets */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Pending snippets</h2>
            <Link to="/admin/moderation" className={styles.panelLink}>View all →</Link>
          </div>
          {pending.length === 0
            ? <p className={styles.empty}>No snippets awaiting review 🎉</p>
            : pending.map((s) => (
                <div key={s._id} className={styles.queueRow}>
                  <div className={styles.queueThumb}>
                    {s.thumbnailUrl ? <img src={s.thumbnailUrl} alt="" /> : <span>♪</span>}
                  </div>
                  <div className={styles.queueInfo}>
                    <p className={styles.queueTitle}>{s.title}</p>
                    <p className={styles.queueMeta}>
                      by {s.creatorId?.name} · {s.durationSecs}s
                    </p>
                  </div>
                  <Link
                    to="/admin/moderation"
                    className="btn btn-ghost"
                    style={{ padding:"5px 12px", fontSize:"0.78rem" }}
                  >
                    Review
                  </Link>
                </div>
              ))
          }
        </div>

        {/* Open reports */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Open reports</h2>
            <Link to="/admin/moderation" className={styles.panelLink}>View all →</Link>
          </div>
          {reports.length === 0
            ? <p className={styles.empty}>No open reports 🎉</p>
            : reports.map((r) => (
                <div key={r._id} className={styles.queueRow}>
                  <div className={styles.reportIcon}>⚑</div>
                  <div className={styles.queueInfo}>
                    <p className={styles.queueTitle}>{r.snippetId?.title || "Unknown snippet"}</p>
                    <p className={styles.queueMeta}>
                      {r.reason} · by {r.reportedBy?.name}
                    </p>
                  </div>
                  <span className="badge badge-danger">{r.reason}</span>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
