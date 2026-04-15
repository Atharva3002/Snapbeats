import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/common/Navbar";
import SnippetCard from "../../components/user/SnippetCard";
import MoodFilter from "../../components/user/MoodFilter";
import { getSnippetsAPI } from "../../api/snippets";
import toast from "react-hot-toast";
import styles from "./Browse.module.css";

const Browse = () => {
  const [mood,     setMood]     = useState(null);
  const [query,    setQuery]    = useState("");
  const [snippets, setSnippets] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchSnippets = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const { data } = await getSnippetsAPI({
        mood:  mood || undefined,
        page:  currentPage,
        limit: 24,
      });
      const incoming = data.snippets || [];
      setSnippets((prev) => reset ? incoming : [...prev, ...incoming]);
      setHasMore(incoming.length === 24);
      reset ? setPage(2) : setPage((p) => p + 1);
    } catch {
      toast.error("Could not load snippets");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [mood, page]);

  useEffect(() => { fetchSnippets(true); }, [mood]);

  const filtered = query.trim()
    ? snippets.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.creatorId?.name?.toLowerCase().includes(query.toLowerCase())
      )
    : snippets;

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>Browse Snippets</h1>
          <p className={styles.sub}>Filter by mood or search for a title</p>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search by title or creator..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className={styles.clearBtn} onClick={() => setQuery("")}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <p className={styles.sideLabel}>Filter by mood</p>
          <div className={styles.moodList}>
            <button
              className={`${styles.moodItem} ${!mood ? styles.moodActive : ""}`}
              onClick={() => setMood(null)}
            >
              🎵 All moods
            </button>
            {["Relax","Focus","Motivation","Party","Sad","Happy","Chill","Hype","Romance","Study"].map((m) => (
              <button
                key={m}
                className={`${styles.moodItem} ${mood === m ? styles.moodActive : ""}`}
                onClick={() => setMood(mood === m ? null : m)}
              >
                {getMoodEmoji(m)} {m}
              </button>
            ))}
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.resultsBar}>
            <span className={styles.resultCount}>
              {loading ? "Loading..." : `${filtered.length}${hasMore ? "+" : ""} snippets`}
            </span>
            {mood && (
              <span className={styles.activeFilter}>
                {mood}
                <button className={styles.removeFilter} onClick={() => setMood(null)}>✕</button>
              </span>
            )}
          </div>

          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <span>🎵</span>
              <p>No snippets found{query ? ` for "${query}"` : ""}.</p>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {filtered.map((s) => (
                  <SnippetCard
                    key={s._id}
                    snippet={s}
                    onLikeUpdate={(u) =>
                      setSnippets((prev) => prev.map((x) => (x._id === u._id ? u : x)))
                    }
                  />
                ))}
              </div>

              {hasMore && !query && (
                <div className={styles.loadMore}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => fetchSnippets(false)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? <span className="spinner" /> : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const getMoodEmoji = (m) => {
  const map = { Relax:"😌", Focus:"🎯", Motivation:"💪", Party:"🎉", Sad:"😢",
                Happy:"😊", Chill:"🌊", Hype:"🔥", Romance:"💕", Study:"📚" };
  return map[m] || "🎵";
};

export default Browse;
