import { apiRequest } from "./client";

export const getAnalytics = () => apiRequest<any>("/api/analytics");
export const getDashboard = () => apiRequest<any>("/api/dashboard");
