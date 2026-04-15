import api from "./axios";
export const getCommentsAPI   = (sid,p) => api.get(`/comments/${sid}`,         { params: p });
export const addCommentAPI    = (sid,d) => api.post(`/comments/${sid}`,         d);
export const deleteCommentAPI = (id)    => api.delete(`/comments/${id}`);
export const reportSnippetAPI = (sid,d) => api.post(`/comments/report/${sid}`,  d);
