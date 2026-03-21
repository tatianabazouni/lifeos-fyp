import { apiRequest } from "./client";

export const getBoards = () => apiRequest<any[]>("/api/boards");
export const createBoard = (payload: Record<string, unknown>) => apiRequest<any>("/api/boards", { method: "POST", body: JSON.stringify(payload) });
export const deleteBoard = (id: string) => apiRequest<{ message: string }>(`/api/boards/${id}`, { method: "DELETE" });

export const getVisionItems = (boardId?: string) => apiRequest<any[]>(`/api/vision-items${boardId ? `?boardId=${boardId}` : ""}`);
export const createVisionItem = (payload: Record<string, unknown>) => apiRequest<any>("/api/vision-items", { method: "POST", body: JSON.stringify(payload) });
export const updateVisionItem = (id: string, payload: Record<string, unknown>) => apiRequest<any>(`/api/vision-items/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteVisionItem = (id: string) => apiRequest<{ message: string }>(`/api/vision-items/${id}`, { method: "DELETE" });
