import { apiRequest } from "./client";

export const getCurrentUser = () => apiRequest<any>("/api/users/me");
export const updateCurrentUser = (payload: Record<string, unknown>) => apiRequest<any>("/api/users/me", { method: "PUT", body: JSON.stringify(payload) });
