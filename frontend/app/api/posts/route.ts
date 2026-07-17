import { POST_API_URL, proxyResponse } from "@/lib/server-api";

export async function GET(request: Request) {
  const query = new URL(request.url).search;
  return proxyResponse(`${POST_API_URL}/api/posts/${query}`);
}
