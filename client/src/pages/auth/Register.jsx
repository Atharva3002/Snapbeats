import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { registerThunk, clearError } from "../../store/slices/authSlice";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Auth.module.css";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });

  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error("Fill in all fields"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    dispatch(registerThunk(form));
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>♪</span>
          <span className={styles.logoText}>SnapBeats</span>
        </div>

        <h1 className={styles.title}>Join SnapBeats</h1>
        <p className={styles.sub}>Create your account to get started</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <input className="input" type="text" name="name" placeholder="Your name"
              value={form.name} onChange={handleChange} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className="input" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} autoComplete="email" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className="input" type="password" name="password" placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange} autoComplete="new-password" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>I want to join as</label>
            <div className={styles.roleRow}>
              {["user", "creator"].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={styles.roleBtn + (form.role === r ? " " + styles.roleBtnActive : "")}
                  onClick={() => setForm((p) => ({ ...p, role: r }))}
                >
                  <span className={styles.roleIcon}>{r === "user" ? "🎧" : "🎤"}</span>
                  <span className={styles.roleName}>{r === "user" ? "Listener" : "Creator"}</span>
                  <span className={styles.roleDesc}>
                    {r === "user" ? "Discover & stream" : "Upload & grow"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className={"btn btn-primary " + styles.submit} disabled={loading}>
            {loading ? <span className="spinner" /> : "Create account"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
