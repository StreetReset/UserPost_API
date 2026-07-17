import { NextResponse } from "next/server";

import { USER_API_URL } from "@/lib/server-api";

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as {
    username: string;
    password: string;
  };
  const form = new URLSearchParams({ username, password });

  try {
    const response = await fetch(`${USER_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const result = NextResponse.json({ ok: true });
    result.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 30,
    });
    result.cookies.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return result;
  } catch {
    return NextResponse.json(
      { detail: "User service сейчас недоступен" },
      { status: 503 },
    );
  }
}
