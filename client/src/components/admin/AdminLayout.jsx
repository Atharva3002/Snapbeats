import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import styles from "./AdminLayout.module.css";

const links = [
  { to: "/admin",            label: "Dashboard",  icon: "◈", end: true },
  { to: "/admin/moderation", label: "Moderation", icon: "🛡" },
  { to: "/admin/users",      label: "Users",      icon: "👥" },
];

const AdminLayout = () => {
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
          <span className={styles.adminBadge}>Admin</span>
        </div>

        <p className={styles.sectionLabel}>Control Panel</p>

        <nav className={styles.nav}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
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
          <div className={styles.adminInfo}>
            <div className={styles.avatar}>
              {user?.avatar
                ? <img src={user.avatar} alt="" />
                : <span>{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <div>
              <p className={styles.adminName}>{user?.name}</p>
              <p className={styles.adminRole}>Administrator</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
