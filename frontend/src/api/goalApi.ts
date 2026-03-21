import { apiRequest } from "./client";

export const getGoals = () => apiRequest<any[]>("/api/goals");
export const createGoal = (payload: Record<string, unknown>) => apiRequest<any>("/api/goals", { method: "POST", body: JSON.stringify(payload) });
export const updateGoal = (id: string, payload: Record<string, unknown>) => apiRequest<any>(`/api/goals/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteGoal = (id: string) => apiRequest<{ message: string }>(`/api/goals/${id}`, { method: "DELETE" });
