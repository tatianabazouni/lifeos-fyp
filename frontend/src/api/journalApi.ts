import { apiRequest } from "./client";

export const getJournalEntries = () => apiRequest<any[]>("/api/journal");
export const createJournalEntry = (payload: Record<string, unknown>) => apiRequest<any>("/api/journal", { method: "POST", body: JSON.stringify(payload) });
export const updateJournalEntry = (id: string, payload: Record<string, unknown>) => apiRequest<any>(`/api/journal/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteJournalEntry = (id: string) => apiRequest<{ message: string }>(`/api/journal/${id}`, { method: "DELETE" });
