import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";

// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// User
import Home from "../pages/user/Home";
import Browse from "../pages/user/Browse";
import Player from "../pages/user/Player";
import Profile from "../pages/user/Profile";

// Creator
import CreatorLayout from "../components/creator/CreatorLayout";
import CreatorDashboard from "../pages/creator/Dashboard";
import Upload from "../pages/creator/Upload";
import Analytics from "../pages/creator/Analytics";

// Admin
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminModeration from "../pages/admin/Moderation";
import AdminUsers from "../pages/admin/Users";

const AppRouter = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.role === "admin" ? (
            <Navigate to="/admin" replace />
          ) : user.role === "creator" ? (
            <Navigate to="/creator" replace />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />

      {/* User routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse"
        element={
          <ProtectedRoute>
            <Browse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/snippet/:id"
        element={
          <ProtectedRoute>
            <Player />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Creator routes — nested under sidebar layout */}
      <Route
        path="/creator"
        element={
          <ProtectedRoute roles={["creator"]}>
            <CreatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CreatorDashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Admin routes — nested under sidebar layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="moderation" element={<AdminModeration />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
