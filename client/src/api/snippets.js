import api from "./axios";
export const getSnippetsAPI        = (p)    => api.get("/snippets",                 { params: p });
export const getSnippetByIdAPI     = (id)   => api.get(`/snippets/${id}`);
export const uploadSnippetAPI      = (form) => api.post("/snippets/upload", form,   { headers: { "Content-Type": "multipart/form-data" } });
export const likeSnippetAPI        = (id)   => api.post(`/snippets/${id}/like`);
export const getMySnippetsAPI      = ()     => api.get("/snippets/my/snippets");
export const deleteSnippetAPI      = (id)   => api.delete(`/snippets/${id}`);
export const getCreatorSnippetsAPI = (id,p) => api.get(`/snippets/creator/${id}`,   { params: p });
