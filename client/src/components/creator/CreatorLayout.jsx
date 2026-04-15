import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import styles from "./CreatorLayout.module.css";

const links = [
  { to: "/creator",           label: "Dashboard",  icon: "◈" },
  { to: "/creator/upload",    label: "Upload",      icon: "⬆" },
  { to: "/creator/analytics", label: "Analytics",  icon: "◎" },
];

const CreatorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>♪</span>
          <span className={styles.logoText}>SnapBeats</span>
        </div>

        <p className={styles.sectionLabel}>Creator Studio</p>

        <nav className={styles.nav}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/creator"}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ""}`
              }
            >
              <span className={styles.linkIcon}>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.bottom}>
          <NavLink to={`/profile/${user?._id}`} className={styles.profileLink}>
            <div className={styles.avatar}>
              {user?.avatar
                ? <img src={user.avatar} alt="" />
                : <span>{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user?.name}</p>
              <p className={styles.profileRole}>Creator</p>
            </div>
          </NavLink>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default CreatorLayout;
