import { useState, useEffect } from "react";
import { getMySnippetsAPI } from "../../api/snippets";
import { formatCount } from "../../utils/helpers";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import styles from "./Analytics.module.css";

const BAR_COLORS = [
  "#c8f04d","#9d6ef5","#f05050","#fbbf24","#4ade80",
  "#60a5fa","#f472b6","#34d399","#fb923c","#a78bfa",
];

const Analytics = () => {
  const { user }  = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState("plays");

  useEffect(() => {
    getMySnippetsAPI()
      .then(({ data }) => setSnippets(data.snippets || []))
      .catch(() => toast.error("Could not load analytics"))
      .finally(() => setLoading(false));
  }, []);

  const approved = snippets.filter((s) => s.status === "approved");
  const sorted   = [...approved].sort((a, b) => {
    if (sort === "plays") return (b.plays || 0) - (a.plays || 0);
    if (sort === "likes") return (b.likes?.length || 0) - (a.likes?.length || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPlays = approved.reduce((acc, s) => acc + (s.plays || 0), 0);
  const totalLikes = approved.reduce((acc, s) => acc + (s.likes?.length || 0), 0);
  const avgPlays   = approved.length ? Math.round(totalPlays / approved.length) : 0;

  // Mood breakdown
  const moodMap = {};
  approved.forEach((s) => {
    s.moodTags?.forEach((t) => { moodMap[t] = (moodMap[t] || 0) + s.plays; });
  });
  const moodData = Object.entries(moodMap).sort((a, b) => b[1] - a[1]);
  const maxMood  = moodData[0]?.[1] || 1;

  // Top 5 by plays for bar chart
  const topSnippets  = [...approved].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5);
  const maxPlays     = topSnippets[0]?.plays || 1;

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}><div className="spinner" style={{ width:36, height:36 }} /></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Analytics</h1>
        <p className={styles.pageSub}>Performance overview for your approved snippets</p>
      </div>

      {/* KPI cards */}
      <div className={styles.kpiRow}>
        {[
          { label: "Live snippets",    val: approved.length,        icon: "◈", accent: false },
          { label: "Total plays",      val: formatCount(totalPlays), icon: "▶", accent: true  },
          { label: "Total likes",      val: formatCount(totalLikes), icon: "♥", accent: false },
          { label: "Avg plays / clip", val: formatCount(avgPlays),   icon: "◎", accent: false },
        ].map((k) => (
          <div key={k.label} className={`${styles.kpiCard} ${k.accent ? styles.kpiAccent : ""}`}>
            <span className={styles.kpiIcon}>{k.icon}</span>
            <span className={styles.kpiVal}>{k.val}</span>
            <span className={styles.kpiLabel}>{k.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.chartsRow}>
        {/* Top snippets bar chart */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Top 5 by plays</h2>
          {topSnippets.length === 0
            ? <p className={styles.chartEmpty}>No approved snippets yet.</p>
            : (
              <div className={styles.barChart}>
                {topSnippets.map((s, i) => (
                  <div key={s._id} className={styles.barRow}>
                    <p className={styles.barLabel} title={s.title}>{s.title}</p>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          width: `${((s.plays || 0) / maxPlays) * 100}%`,
                          background: BAR_COLORS[i % BAR_COLORS.length],
                        }}
                      />
                    </div>
                    <span className={styles.barVal}>{formatCount(s.plays)}</span>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Mood breakdown */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Plays by mood</h2>
          {moodData.length === 0
            ? <p className={styles.chartEmpty}>No mood data yet.</p>
            : (
              <div className={styles.moodChart}>
                {moodData.map(([mood, plays], i) => (
                  <div key={mood} className={styles.moodRow}>
                    <span className={styles.moodLabel}>{mood}</span>
                    <div className={styles.moodTrack}>
                      <div
                        className={styles.moodFill}
                        style={{
                          width: `${(plays / maxMood) * 100}%`,
                          background: BAR_COLORS[i % BAR_COLORS.length],
                        }}
                      />
                    </div>
                    <span className={styles.moodVal}>{formatCount(plays)}</span>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Full table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.chartTitle}>All snippets</h2>
          <div className={styles.sortRow}>
            <span className={styles.sortLabel}>Sort by:</span>
            {["plays","likes","recent"].map((s) => (
              <button
                key={s}
                className={`${styles.sortBtn} ${sort === s ? styles.sortActive : ""}`}
                onClick={() => setSort(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {sorted.length === 0 ? (
          <p className={styles.chartEmpty}>No approved snippets yet.</p>
        ) : (
          <div className={styles.snipTable}>
            <div className={styles.snipHead}>
              <span>Title</span><span>Plays</span><span>Likes</span>
              <span>Mood tags</span><span>Duration</span><span>Uploaded</span>
            </div>
            {sorted.map((s) => (
              <div key={s._id} className={styles.snipRow}>
                <p className={styles.snipTitle}>{s.title}</p>
                <span className={styles.snipStat} style={{ color: "var(--accent)" }}>
                  ▶ {formatCount(s.plays)}
                </span>
                <span className={styles.snipStat} style={{ color: "var(--danger)" }}>
                  ♥ {formatCount(s.likes?.length || 0)}
                </span>
                <span className={styles.snipTags}>
                  {s.moodTags?.slice(0, 2).join(", ")}{s.moodTags?.length > 2 ? "…" : ""}
                </span>
                <span className={styles.snipStat}>{s.durationSecs}s</span>
                <span className={styles.snipDate}>
                  {new Date(s.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
