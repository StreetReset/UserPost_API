import {
  authHeaders,
  jsonBody,
  POST_API_URL,
  proxyResponse,
} from "@/lib/server-api";

export async function GET(request: Request) {
  const query = new URL(request.url).search;
  return proxyResponse(`${POST_API_URL}/api/me/posts/${query}`, {
    headers: await authHeaders(),
  });
}

export async function POST(request: Request) {
  return proxyResponse(`${POST_API_URL}/api/me/posts/drafts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders()),
    },
    body: await jsonBody(request),
  });
}
