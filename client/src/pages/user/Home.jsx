import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import SnippetCard from "../../components/user/SnippetCard";
import MoodFilter from "../../components/user/MoodFilter";
import { getSnippetsAPI } from "../../api/snippets";
import { getFeedAPI } from "../../api/users";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import styles from "./Home.module.css";

const TABS = ["Discover", "Following"];

const Home = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [tab,       setTab]       = useState("Discover");
  const [mood,      setMood]      = useState(null);
  const [snippets,  setSnippets]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [hasMore,   setHasMore]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchSnippets = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) { setLoading(true); setSnippets([]); }
    else setLoadingMore(true);

    try {
      let data;
      if (tab === "Following") {
        const res = await getFeedAPI({ page: currentPage, limit: 20 });
        data = res.data;
      } else {
        const res = await getSnippetsAPI({ mood: mood || undefined, page: currentPage, limit: 20 });
        data = res.data;
      }
      const incoming = data.snippets || [];
      setSnippets((prev) => reset ? incoming : [...prev, ...incoming]);
      setHasMore(incoming.length === 20);
      if (!reset) setPage((p) => p + 1);
      else setPage(2);
    } catch {
      toast.error("Could not load snippets");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [tab, mood, page]);

  useEffect(() => { fetchSnippets(true); }, [tab, mood]);

  const handleMoodChange = (m) => { setMood(m); };
  const handleTabChange  = (t) => { setTab(t); setMood(null); };

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroTag}>Music · Snippets · 15–60s</p>
          <h1 className={styles.heroTitle}>
            The best part<br />of every song.
          </h1>
          <p className={styles.heroSub}>
            Discover 15–60 second music snippets curated by mood. No distractions, just music.
          </p>
        </div>
        <div className={styles.heroBg} />
      </div>

      <div className={styles.content}>
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => handleTabChange(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Discover" && (
          <div className={styles.filterWrap}>
            <MoodFilter active={mood} onChange={handleMoodChange} />
          </div>
        )}

        {loading ? (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : snippets.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎵</span>
            <p>{tab === "Following" ? "Follow some creators to see their snippets here." : "No snippets found for this mood."}</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {snippets.map((s) => (
                <SnippetCard
                  key={s._id}
                  snippet={s}
                  onLikeUpdate={(updated) =>
                    setSnippets((prev) => prev.map((x) => (x._id === updated._id ? updated : x)))
                  }
                />
              ))}
            </div>

            {hasMore && (
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
      </div>
    </div>
  );
};

export default Home;
