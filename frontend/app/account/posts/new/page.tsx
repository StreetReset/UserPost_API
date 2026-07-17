"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/client-api";

export default function NewPostPage() {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const data = new FormData(event.currentTarget); try { await apiFetch("/api/me/posts", { method: "POST", body: JSON.stringify({ title: data.get("title"), content: data.get("content") }) }); router.push("/account"); } catch (err) { setError(err instanceof Error ? err.message : "Не удалось сохранить"); } finally { setLoading(false); } }
  return <><PageHeader title="Новый черновик" back /><form onSubmit={submit} className="p-4"><input name="title" maxLength={100} required autoFocus placeholder="Заголовок" className="w-full border-b border-[#2f3336] bg-transparent py-4 text-2xl font-bold outline-none placeholder:text-[#536471]" /><textarea name="content" required placeholder="Что происходит?" className="mt-4 min-h-[320px] w-full resize-none bg-transparent text-lg leading-7 outline-none placeholder:text-[#536471]" />{error && <p className="my-4 text-sm text-red-400">{error}</p>}<div className="flex justify-end border-t border-[#2f3336] pt-4"><button disabled={loading} className="rounded-full bg-[#1d9bf0] px-6 py-2.5 font-bold hover:bg-[#1a8cd8] disabled:opacity-50">{loading ? "Сохраняем…" : "Сохранить черновик"}</button></div></form></>;
}
