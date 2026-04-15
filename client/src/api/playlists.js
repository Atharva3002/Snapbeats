import api from "./axios";
export const createPlaylistAPI     = (d)      => api.post("/playlists",                  d);
export const getMyPlaylistsAPI     = ()       => api.get("/playlists/my");
export const addToPlaylistAPI      = (id,d)   => api.post(`/playlists/${id}/add`,         d);
export const removeFromPlaylistAPI = (id,sid) => api.delete(`/playlists/${id}/remove/${sid}`);
export const deletePlaylistAPI     = (id)     => api.delete(`/playlists/${id}`);
