import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import SnippetCard from "../../components/user/SnippetCard";
import { getProfileAPI } from "../../api/users";
import { getCreatorSnippetsAPI } from "../../api/snippets";
import { followUserAPI } from "../../api/users";
import { useAuth } from "../../hooks/useAuth";
import { formatCount } from "../../utils/helpers";
import toast from "react-hot-toast";
import styles from "./Profile.module.css";

const Profile = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile,   setProfile]   = useState(null);
  const [snippets,  setSnippets]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [following, setFollowing] = useState(false);

  const isOwn = user?._id === id;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getProfileAPI(id);
        setProfile(data.user);
        setFollowing(data.user.followers?.includes(user?._id));
        if (data.user.role === "creator") {
          const { data: sd } = await getCreatorSnippetsAPI(id, { limit: 20 });
          setSnippets(sd.snippets || []);
        }
      } catch {
        toast.error("Profile not found");
        navigate("/browse");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleFollow = async () => {
    if (!user) { toast.error("Sign in to follow"); return; }
    try {
      await followUserAPI(id);
      setFollowing((f) => !f);
      setProfile((p) => ({
        ...p,
        totalFollowers: following ? p.totalFollowers - 1 : p.totalFollowers + 1,
      }));
    } catch { toast.error("Could not update follow"); }
  };

  if (loading) {
    return (
      <div className={styles.page}><Navbar />
        <div className={styles.loadingWrap}><div className="spinner" style={{ width:36, height:36 }} /></div>
      </div>
    );
  }
  if (!profile) return null;

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className={styles.avatarWrap}>
            {profile.avatar
              ? <img src={profile.avatar} alt={profile.name} className={styles.avatarImg} />
              : <div className={styles.avatarFallback}>{profile.name?.[0]?.toUpperCase()}</div>}
          </div>

          <div className={styles.heroInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{profile.name}</h1>
              <span className={`badge ${profile.role === "creator" ? "badge-accent" : "badge-purple"}`}>
                {profile.role}
              </span>
            </div>
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

            <div className={styles.stats}>
              {profile.role === "creator" && (
                <>
                  <div className={styles.stat}>
                    <span className={styles.statVal}>{formatCount(profile.totalFollowers)}</span>
                    <span className={styles.statLabel}>Followers</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statVal}>{formatCount(profile.totalPlays)}</span>
                    <span className={styles.statLabel}>Total plays</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statVal}>{snippets.length}</span>
                    <span className={styles.statLabel}>Snippets</span>
                  </div>
                </>
              )}
              <div className={styles.stat}>
                <span className={styles.statVal}>
                  {new Date(profile.createdAt).toLocaleDateString("en-IN", { month:"short", year:"numeric" })}
                </span>
                <span className={styles.statLabel}>Joined</span>
              </div>
            </div>
          </div>

          {!isOwn && profile.role === "creator" && user && (
            <button
              className={`btn ${following ? "btn-ghost" : "btn-primary"}`}
              style={{ alignSelf: "flex-start" }}
              onClick={handleFollow}
            >
              {following ? "Following" : "Follow"}
            </button>
          )}
          {isOwn && (
            <button
              className="btn btn-ghost"
              style={{ alignSelf: "flex-start" }}
              onClick={() => navigate(profile.role === "creator" ? "/creator" : "/home")}
            >
              {profile.role === "creator" ? "Go to Dashboard →" : "Browse Music →"}
            </button>
          )}
        </div>
      </div>

      {/* Creator snippets */}
      {profile.role === "creator" && (
        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Snippets</h2>
          {snippets.length === 0
            ? <div className={styles.empty}><span>🎵</span><p>No snippets yet.</p></div>
            : (
              <div className={styles.grid}>
                {snippets.map((s) => (
                  <SnippetCard
                    key={s._id}
                    snippet={s}
                    onLikeUpdate={(u) => setSnippets((prev) => prev.map((x) => x._id === u._id ? u : x))}
                  />
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Profile;
