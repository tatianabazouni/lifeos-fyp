import { apiRequest } from "./client";

export const getConnections = () => apiRequest<any[]>("/api/connections");
export const searchUsers = (q: string) => apiRequest<any[]>(`/api/connections/users/search?q=${encodeURIComponent(q)}`);
export const requestConnection = (payload: { userId: string; type?: string }) => apiRequest<any>("/api/connections/request", { method: "POST", body: JSON.stringify(payload) });
export const acceptConnection = (connectionId: string) => apiRequest<{ message: string }>("/api/connections/accept", { method: "PUT", body: JSON.stringify({ connectionId }) });
