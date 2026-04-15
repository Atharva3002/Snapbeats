import { useState, useEffect } from "react";
import { getAdminUsersAPI, toggleUserAPI } from "../../api/admin";
import { formatCount } from "../../utils/helpers";
import toast from "react-hot-toast";
import styles from "./Users.module.css";

const ROLES = ["all", "user", "creator", "admin"];

const Users = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [role,    setRole]    = useState("all");
  const [query,   setQuery]   = useState("");
  const [acting,  setActing]  = useState(null);

  useEffect(() => {
    setLoading(true);
    getAdminUsersAPI({ role: role === "all" ? undefined : role, limit: 100 })
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => toast.error("Could not load users"))
      .finally(() => setLoading(false));
  }, [role]);

  const handleToggle = async (id) => {
    setActing(id);
    try {
      const { data } = await toggleUserAPI(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: data.user.isActive } : u));
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Action failed"); }
    finally { setActing(null); }
  };

  const filtered = query.trim()
    ? users.filter((u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
    : users;

  const roleCounts = {
    all:     users.length,
    user:    users.filter((u) => u.role === "user").length,
    creator: users.filter((u) => u.role === "creator").length,
    admin:   users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Users</h1>
          <p className={styles.pageSub}>Manage all platform users and creators</p>
        </div>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Role tabs */}
      <div className={styles.tabs}>
        {ROLES.map((r) => (
          <button
            key={r}
            className={`${styles.tab} ${role === r ? styles.tabActive : ""}`}
            onClick={() => setRole(r)}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
            <span className={styles.tabCount}>{roleCounts[r]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.skeletons}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skeletonRow} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>👤</span>
          <p>No users found{query ? ` for "${query}"` : ""}.</p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>User</span>
            <span>Role</span>
            <span>Subscription</span>
            <span>Joined</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {filtered.map((u) => (
            <div key={u._id} className={`${styles.tableRow} ${!u.isActive ? styles.rowInactive : ""}`}>
              <div className={styles.userCell}>
                <div className={styles.userAvatar}>
                  {u.avatar
                    ? <img src={u.avatar} alt="" />
                    : <span>{u.name?.[0]?.toUpperCase()}</span>}
                </div>
                <div className={styles.userInfo}>
                  <p className={styles.userName}>{u.name}</p>
                  <p className={styles.userEmail}>{u.email}</p>
                </div>
              </div>

              <span className={styles.cell}>
                <span className={`badge ${
                  u.role === "admin"   ? "badge-danger"  :
                  u.role === "creator" ? "badge-accent"  : "badge-purple"
                }`}>{u.role}</span>
              </span>

              <span className={styles.cell}>
                <span className={`badge ${u.subscriptionStatus === "premium" ? "badge-success" : ""}`}
                  style={u.subscriptionStatus !== "premium" ? { background:"var(--surface-2)", color:"var(--text-3)" } : {}}>
                  {u.subscriptionStatus}
                </span>
              </span>

              <span className={styles.cell} style={{ fontSize:"0.78rem", color:"var(--text-3)" }}>
                {new Date(u.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
              </span>

              <span className={styles.cell}>
                <span className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}>
                  {u.isActive ? "Active" : "Banned"}
                </span>
              </span>

              <span className={styles.cell}>
                {u.role !== "admin" && (
                  <button
                    className={`btn ${u.isActive ? "btn-danger" : "btn-ghost"}`}
                    style={{ padding:"5px 12px", fontSize:"0.78rem" }}
                    onClick={() => handleToggle(u._id)}
                    disabled={acting === u._id}
                  >
                    {acting === u._id
                      ? <span className="spinner" style={{ width:14, height:14 }} />
                      : u.isActive ? "Ban" : "Unban"}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
