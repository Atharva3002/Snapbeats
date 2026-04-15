import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI, registerAPI, getMeAPI } from "../../api/auth";

export const loginThunk = createAsyncThunk("auth/login", async (creds, { rejectWithValue }) => {
  try {
    const { data } = await loginAPI(creds);
    localStorage.setItem("accessToken",  data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const registerThunk = createAsyncThunk("auth/register", async (creds, { rejectWithValue }) => {
  try {
    const { data } = await registerAPI(creds);
    localStorage.setItem("accessToken",  data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const getMeThunk = createAsyncThunk("auth/getMe", async (_, { rejectWithValue }) => {
  try {
    const { data } = await getMeAPI();
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: false, error: null, initialized: false },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.clear();
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending  = (s) => { s.loading = true;  s.error = null; };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; };

    builder
      .addCase(loginThunk.pending,    pending)
      .addCase(loginThunk.fulfilled,  (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(loginThunk.rejected,   rejected)
      .addCase(registerThunk.pending,   pending)
      .addCase(registerThunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(registerThunk.rejected,  rejected)
      .addCase(getMeThunk.pending,    (s) => { s.loading = true; })
      .addCase(getMeThunk.fulfilled,  (s, a) => { s.loading = false; s.user = a.payload; s.initialized = true; })
      .addCase(getMeThunk.rejected,   (s) => { s.loading = false; s.initialized = true; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
