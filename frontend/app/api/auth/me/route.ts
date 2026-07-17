import { authHeaders, proxyResponse, USER_API_URL } from "@/lib/server-api";

export async function GET() {
  return proxyResponse(`${USER_API_URL}/auth/me`, {
    headers: await authHeaders(),
  });
}
