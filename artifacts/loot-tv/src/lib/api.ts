const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
export const DEMO_MODE =
  import.meta.env.VITE_DEMO_MODE === "true" ||
  (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE !== "false");

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error ?? "API request failed");
  }

  return response.json() as Promise<T>;
}

export async function maybeApi<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    return await apiRequest<T>(path, init);
  } catch (error) {
    if (!DEMO_MODE) throw error;
    return fallback;
  }
}

export function realtimeUrl(streamId: string) {
  const base = API_BASE || window.location.origin;
  const url = new URL(base, window.location.href);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/api/realtime";
  url.searchParams.set("streamId", streamId);
  return url.toString();
}
