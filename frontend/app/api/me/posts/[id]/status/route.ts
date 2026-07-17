import { authHeaders, POST_API_URL, proxyResponse } from "@/lib/server-api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { action } = (await request.json()) as {
    action: "publish" | "archive";
  };

  if (action !== "publish" && action !== "archive") {
    return Response.json({ detail: "Unknown status action" }, { status: 400 });
  }

  return proxyResponse(`${POST_API_URL}/api/me/posts/${action}/${id}`, {
    method: "PATCH",
    headers: await authHeaders(),
  });
}
