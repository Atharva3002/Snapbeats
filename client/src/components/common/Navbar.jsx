import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user, isCreator, isAdmin, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const active = (path) => location.pathname === path ? styles.active : "";

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const navLinks = isAdmin
    ? [
        { to: "/admin",            label: "Dashboard" },
        { to: "/admin/moderation", label: "Moderation" },
        { to: "/admin/users",      label: "Users" },
      ]
    : isCreator
    ? [
        { to: "/creator",           label: "Dashboard" },
        { to: "/creator/upload",    label: "Upload" },
        { to: "/creator/analytics", label: "Analytics" },
      ]
    : [
        { to: "/home",   label: "Home" },
        { to: "/browse", label: "Browse" },
      ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>♪</span>
          <span className={styles.logoText}>SnapBeats</span>
        </Link>

        <div className={styles.links}>
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className={`${styles.link} ${active(l.to)}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className={styles.right}>
          {user ? (
            <>
              <Link to={`/profile/${user._id}`} className={styles.avatar}>
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} />
                  : <span>{user.name?.[0]?.toUpperCase()}</span>}
              </Link>
              <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: "0.85rem" }} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: "8px 20px" }}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
