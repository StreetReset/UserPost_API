import type { ApiError } from "@/lib/types";

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiError;
    const detail = Array.isArray(error.detail)
      ? error.detail.map((item) => item.msg).filter(Boolean).join(", ")
      : error.detail;
    throw new Error(detail || "Не удалось выполнить запрос");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
