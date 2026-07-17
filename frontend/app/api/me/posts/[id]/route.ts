import {
  authHeaders,
  jsonBody,
  POST_API_URL,
  proxyResponse,
} from "@/lib/server-api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyResponse(`${POST_API_URL}/api/me/posts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders()),
    },
    body: await jsonBody(request),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyResponse(`${POST_API_URL}/api/me/posts/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
}
