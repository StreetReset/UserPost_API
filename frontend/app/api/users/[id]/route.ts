import { USER_API_URL } from "@/lib/server-api";
import type { PublicUser } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return Response.json({ detail: "Некорректный ID пользователя" }, { status: 422 });
  }

  try {
    const query = new URLSearchParams({ ids: id });
    const response = await fetch(`${USER_API_URL}/users/public?${query}`, {
      cache: "no-store",
    });
    const body = await response.text();

    if (!response.ok) {
      return new Response(body, {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("content-type") ?? "application/json",
        },
      });
    }

    const users = JSON.parse(body) as PublicUser[];
    const user = users[0];

    if (!user) {
      return Response.json({ detail: "Пользователь не найден" }, { status: 404 });
    }

    return Response.json(user);
  } catch {
    return Response.json(
      { detail: "User service сейчас недоступен" },
      { status: 503 },
    );
  }
}
