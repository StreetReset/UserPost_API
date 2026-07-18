import { attachAuthors, POST_API_URL } from "@/lib/server-api";
import type { PublicPost } from "@/lib/types";

export async function GET(request: Request) {
  const query = new URL(request.url).search;

  try {
    const response = await fetch(`${POST_API_URL}/api/posts/${query}`, {
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

    const posts = JSON.parse(body) as PublicPost[];
    return Response.json(await attachAuthors(posts));
  } catch {
    return Response.json(
      { detail: "Post service сейчас недоступен" },
      { status: 503 },
    );
  }
}
