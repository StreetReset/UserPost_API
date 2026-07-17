"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { LoadingFeed } from "@/components/ui-states";
import { apiFetch } from "@/lib/client-api";
import type { Post } from "@/lib/types";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter();
  const [post, setPost] = useState<Post | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => { apiFetch<Post[]>("/api/me/posts?limit=100&offset=0").then((posts) => { const found = posts.find((item) => item.id === Number(id)); if (!found) throw new Error("Пост не найден"); setPost(found); }).catch((err: Error) => setError(err.message)); }, [id]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const data = new FormData(event.currentTarget); try { await apiFetch(`/api/me/posts/${id}`, { method: "PATCH", body: JSON.stringify({ title: data.get("title"), content: data.get("content") }) }); router.push("/account"); } catch (err) { setError(err instanceof Error ? err.message : "Не удалось обновить"); } finally { setLoading(false); } }
  if (!post && !error) return <LoadingFeed />;
  return <><PageHeader title="Редактирование" back />{post ? <form onSubmit={submit} className="p-4"><input name="title" defaultValue={post.title} maxLength={100} required className="w-full border-b border-[#2f3336] bg-transparent py-4 text-2xl font-bold outline-none" /><textarea name="content" defaultValue={post.content} required className="mt-4 min-h-[320px] w-full resize-none bg-transparent text-lg leading-7 outline-none" />{error && <p className="my-4 text-sm text-red-400">{error}</p>}<div className="flex justify-end border-t border-[#2f3336] pt-4"><button disabled={loading} className="rounded-full bg-white px-6 py-2.5 font-bold text-black hover:bg-[#d7dbdc] disabled:opacity-50">{loading ? "Сохраняем…" : "Сохранить"}</button></div></form> : <p className="p-6 text-red-400">{error}</p>}</>;
}
