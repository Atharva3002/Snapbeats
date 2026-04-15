import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error, initialized } = useSelector((s) => s.auth);
  return {
    user,
    loading,
    error,
    initialized,
    isLoggedIn:  !!user,
    isUser:      user?.role === "user",
    isCreator:   user?.role === "creator",
    isAdmin:     user?.role === "admin",
    logout:      () => dispatch(logout()),
  };
};
