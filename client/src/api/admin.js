import api from "./axios";
export const getAdminStatsAPI    = ()       => api.get("/admin/stats");
export const getAdminSnippetsAPI = (p)      => api.get("/admin/snippets",             { params: p });
export const moderateSnippetAPI  = (id, d)  => api.put(`/admin/snippets/${id}/moderate`, d);
export const getAdminUsersAPI    = (p)      => api.get("/admin/users",                { params: p });
export const toggleUserAPI       = (id)     => api.put(`/admin/users/${id}/toggle`);
export const getAdminReportsAPI  = (p)      => api.get("/admin/reports",              { params: p });
export const updateReportAPI     = (id, d)  => api.put(`/admin/reports/${id}`,        d);
