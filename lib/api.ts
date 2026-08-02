export function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") return `http://${window.location.hostname}:5134/api`;
  return "http://localhost:5134/api";
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: unknown) {
    super(message);
    
  }
}

type ApiOptions = RequestInit & { auth?: boolean };

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  const storedToken = localStorage.getItem("access_token");
  if (storedToken) return storedToken;

  const cookieToken = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("access_token="))
    ?.slice("access_token=".length);
  return cookieToken ? decodeURIComponent(cookieToken) : null;
}

function getApiErrorMessage(body: unknown) {
  if (typeof body === "string" && body.trim()) return body.trim();
  if (!body || typeof body !== "object") return "เกิดข้อผิดพลาด กรุณาลองใหม่";

  const errorBody = body as Record<string, unknown>;
  if (typeof errorBody.message === "string") return errorBody.message;
  if (typeof errorBody.title === "string" && errorBody.errors && typeof errorBody.errors === "object") {
    const validationMessages = Object.values(errorBody.errors as Record<string, unknown>)
      .flatMap((value) => Array.isArray(value) ? value : [])
      .filter((value): value is string => typeof value === "string");
    if (validationMessages.length) return validationMessages.join(" ");
    return errorBody.title;
  }
  if (typeof errorBody.title === "string") return errorBody.title;
  return "เกิดข้อผิดพลาด กรุณาลองใหม่";
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.auth !== false && typeof window !== "undefined") {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const responseText = await response.text();
  let body: unknown = {};
  if (responseText) {
    try {
      body = JSON.parse(responseText);
    } catch {
      body = responseText;
    }
  }
  if (!response.ok) {
    if (response.status === 401 && options.auth !== false && typeof window !== "undefined") {
      clearSession();
      window.location.href = "/login";
    }
    const message = getApiErrorMessage(body);
    throw new ApiError(
      message === "เกิดข้อผิดพลาด กรุณาลองใหม่"
        ? `เกิดข้อผิดพลาดจาก API (HTTP ${response.status})`
        : message,
      response.status,
      body,
    );
  }
  return body as T;
}

export function saveSession(token: string, user: object) {
  localStorage.setItem("access_token", token);
  localStorage.setItem("user", JSON.stringify(user));
  document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; samesite=lax`;
  const role = "role" in user ? String(user.role) : "";
  document.cookie = `user_role=${encodeURIComponent(role)}; path=/; max-age=86400; samesite=lax`;
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  document.cookie = "access_token=; path=/; max-age=0; samesite=lax";
  document.cookie = "user_role=; path=/; max-age=0; samesite=lax";
}

export function getUser(): { fullName?: string; username?: string; role?: string } {
  try {
    return JSON.parse(localStorage.getItem("user") ?? "{}");
  } catch {
    return {};
  }
}
