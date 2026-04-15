import api from "./axios";
export const getProfileAPI   = (id)  => api.get(`/users/${id}`);
export const updateProfileAPI= (d)   => api.put("/users/me", d, { headers: { "Content-Type": "multipart/form-data" } });
export const followUserAPI   = (id)  => api.post(`/users/${id}/follow`);
export const getFeedAPI      = (p)   => api.get("/users/feed", { params: p });
