import AsyncStorage from "@react-native-async-storage/async-storage";

export const AUTH_TOKEN_KEY = "dc_auth_token";
export const AUTH_USER_KEY = "dc_auth_user";

export const API_BASE = "https://department-connect-api.vercel.app";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      errMsg = body?.error ?? errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
