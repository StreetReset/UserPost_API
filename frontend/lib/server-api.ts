import { cookies } from "next/headers";

import type { PublicUser } from "@/lib/types";

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

export async function attachAuthors<T extends { author_id: number }>(
  posts: T[],
): Promise<Array<T & { author?: PublicUser }>> {
  const authorIds = [...new Set(posts.map((post) => post.author_id))];

  if (authorIds.length === 0) {
    return posts;
  }

  const query = new URLSearchParams();
  authorIds.forEach((id) => query.append("ids", String(id)));

  try {
    const response = await fetch(`${USER_API_URL}/users/public?${query}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return posts;
    }

    const users = (await response.json()) as PublicUser[];
    const usersById = new Map(users.map((user) => [user.id, user]));

    return posts.map((post) => ({
      ...post,
      author: usersById.get(post.author_id),
    }));
  } catch {
    return posts;
  }
}
