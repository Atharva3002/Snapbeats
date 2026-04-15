import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { likeSnippetAPI } from "../../api/snippets";
import { useAuth } from "../../hooks/useAuth";
import { formatDuration, formatCount } from "../../utils/helpers";
import toast from "react-hot-toast";
import styles from "./SnippetCard.module.css";

const SnippetCard = ({ snippet, onLikeUpdate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liking, setLiking] = useState(false);
  const [liked,  setLiked]  = useState(snippet.likes?.includes(user?._id));
  const [count,  setCount]  = useState(snippet.likes?.length ?? 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) { toast.error("Sign in to like snippets"); return; }
    if (liking) return;
    setLiking(true);
    try {
      const { data } = await likeSnippetAPI(snippet._id);
      setLiked(data.liked);
      setCount(data.totalLikes);
      onLikeUpdate?.({ ...snippet, likes: data.totalLikes });
    } catch {
      toast.error("Could not update like");
    } finally {
      setLiking(false);
    }
  };

  return (
    <div className={styles.card} onClick={() => navigate(`/snippet/${snippet._id}`)}>
      <div className={styles.thumb}>
        {snippet.thumbnailUrl
          ? <img src={snippet.thumbnailUrl} alt={snippet.title} />
          : <div className={styles.thumbPlaceholder}><span>♪</span></div>}
        <span className={styles.duration}>{formatDuration(snippet.durationSecs)}</span>
        <div className={styles.playOverlay}><span className={styles.playIcon}>▶</span></div>
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{snippet.title}</p>

        {snippet.creatorId && (
          <p
            className={styles.creator}
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${snippet.creatorId._id}`); }}
          >
            {snippet.creatorId.name}
          </p>
        )}

        <div className={styles.tags}>
          {snippet.moodTags?.slice(0, 3).map((t) => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
        </div>

        <div className={styles.meta}>
          <span className={styles.plays}>▶ {formatCount(snippet.plays)}</span>
          <button className={`${styles.likeBtn} ${liked ? styles.liked : ""}`} onClick={handleLike} disabled={liking}>
            {liked ? "♥" : "♡"} {formatCount(count)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;
