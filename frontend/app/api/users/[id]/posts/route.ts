import { POST_API_URL, proxyResponse } from "@/lib/server-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return Response.json({ detail: "Некорректный ID пользователя" }, { status: 422 });
  }

  const query = new URL(request.url).search;
  return proxyResponse(`${POST_API_URL}/api/posts/author/${id}${query}`);
}
