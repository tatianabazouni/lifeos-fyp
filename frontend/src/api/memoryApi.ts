import { apiRequest } from "./client";

export const getMemories = () => apiRequest<any[]>("/api/life/memories");
export const createMemory = (payload: Record<string, unknown>) => apiRequest<any>("/api/life/memories", { method: "POST", body: JSON.stringify(payload) });
export const updateMemory = (id: string, payload: Record<string, unknown>) => apiRequest<any>(`/api/life/memories/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteMemory = (id: string) => apiRequest<{ message: string }>(`/api/life/memories/${id}`, { method: "DELETE" });
