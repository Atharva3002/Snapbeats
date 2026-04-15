import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Spinner shown while session is being restored on refresh
const Loader = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"var(--bg)" }}>
    <div className="spinner" style={{ width:32, height:32 }} />
  </div>
);

// Usage: <ProtectedRoute roles={["creator","admin"]} />
const ProtectedRoute = ({ children, roles }) => {
  const { user, initialized } = useAuth();

  if (!initialized) return <Loader />;
  if (!user)        return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
