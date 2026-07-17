import { cookies } from "next/headers";

export const USER_API_URL =
  process.env.USER_API_URL ?? "http://127.0.0.1:8000";
export const POST_API_URL =
  process.env.POST_API_URL ?? "http://127.0.0.1:8001";

export async function authHeaders(): Promise<HeadersInit> {
  const token = (await cookies()).get("access_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function proxyResponse(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
    });
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return Response.json(
      { detail: "API сейчас недоступен. Проверьте, запущены ли сервисы." },
      { status: 503 },
    );
  }
}

export async function jsonBody(request: Request): Promise<string> {
  return JSON.stringify(await request.json());
}
