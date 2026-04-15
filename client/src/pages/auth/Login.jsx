import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { loginThunk, clearError } from "../../store/slices/authSlice";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Auth.module.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Fill in all fields"); return; }
    dispatch(loginThunk(form));
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>♪</span>
          <span className={styles.logoText}>SnapBeats</span>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your account</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={"btn btn-primary " + styles.submit} disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign in"}
          </button>
        </form>

        <p className={styles.footer}>
          New to SnapBeats?{" "}
          <Link to="/register" className={styles.link}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
