import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMeThunk } from "./store/slices/authSlice";
import AppRouter from "./routes/AppRouter";

const App = () => {
  const dispatch = useDispatch();

  // Restore session on every page load/refresh
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) dispatch(getMeThunk());
    else {
      // Mark as initialized so ProtectedRoute doesn't spin forever
      dispatch({ type: "auth/getMe/rejected" });
    }
  }, [dispatch]);

  return <AppRouter />;
};

export default App;
