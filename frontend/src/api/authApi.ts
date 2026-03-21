import { apiRequest, clearAuthToken, saveAuthToken } from "./client";

export async function login(payload: { email: string; password: string }) {
  const data = await apiRequest<{ token: string; user: { id: string; name: string; email: string } }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  saveAuthToken(data.token);
  return data;
}

export async function register(payload: { name: string; email: string; password: string }) {
  const data = await apiRequest<{ token: string; user: { id: string; name: string; email: string } }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  saveAuthToken(data.token);
  return data;
}

export async function getProfile() {
  return apiRequest<{ user: any; profile: any }>("/api/auth/profile");
}

export async function updateProfile(payload: Record<string, unknown>) {
  return apiRequest<{ user: any; profile: any }>("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  clearAuthToken();
}
