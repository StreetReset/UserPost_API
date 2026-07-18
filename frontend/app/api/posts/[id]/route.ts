import { attachAuthors, POST_API_URL } from "@/lib/server-api";
import type { PublicPost } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const response = await fetch(`${POST_API_URL}/api/posts/${id}`, {
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

    const post = JSON.parse(body) as PublicPost;
    const [enrichedPost] = await attachAuthors([post]);
    return Response.json(enrichedPost);
  } catch {
    return Response.json(
      { detail: "Post service сейчас недоступен" },
      { status: 503 },
    );
  }
}
