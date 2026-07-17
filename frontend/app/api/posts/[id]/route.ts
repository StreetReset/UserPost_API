import { POST_API_URL, proxyResponse } from "@/lib/server-api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyResponse(`${POST_API_URL}/api/posts/${id}`);
}
