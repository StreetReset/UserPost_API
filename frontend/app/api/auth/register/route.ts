import { jsonBody, proxyResponse, USER_API_URL } from "@/lib/server-api";

export async function POST(request: Request) {
  return proxyResponse(`${USER_API_URL}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await jsonBody(request),
  });
}
