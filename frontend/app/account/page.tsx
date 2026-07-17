"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { EmptyState, ErrorState, LoadingFeed } from "@/components/ui-states";
import { apiFetch } from "@/lib/client-api";
import type { Post, User } from "@/lib/types";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([apiFetch<User>("/api/auth/me"), apiFetch<Post[]>("/api/me/posts?limit=100&offset=0")])
      .then(([me, myPosts]) => { if (active) { setUser(me); setPosts(myPosts); setError(""); } })
      .catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);

  async function statusAction(id: number, action: "publish" | "archive") {
    try { await apiFetch(`/api/me/posts/${id}/status`, { method: "PATCH", body: JSON.stringify({ action }) }); setLoading(true); setReloadKey((value) => value + 1); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось изменить статус"); }
  }

  async function remove(id: number) {
    if (!window.confirm("Удалить этот пост?")) return;
    try { await apiFetch(`/api/me/posts/${id}`, { method: "DELETE" }); setLoading(true); setReloadKey((value) => value + 1); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось удалить пост"); }
  }

  if (loading) return <LoadingFeed />;
  if (error && !user) return <><div className="border-b border-[#2f3336] p-5 text-xl font-bold">Профиль</div><ErrorState message={error} /><div className="px-4"><Link href="/login" className="rounded-full bg-white px-5 py-2 font-bold text-black">Войти</Link></div></>;

  return (
    <>
      {user && <><div className="h-32 bg-gradient-to-br from-[#0b6aa9] via-[#1d9bf0] to-[#74c8ff]" /><section className="border-b border-[#2f3336] px-4 pb-4"><div className="-mt-8 flex items-end justify-between"><span className="rounded-full border-4 border-black"><Avatar name={user.username} size="lg" /></span><Link href="/account/posts/new" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black hover:bg-[#d7dbdc]">Новый пост</Link></div><h1 className="mt-3 text-xl font-extrabold">{user.first_name} {user.last_name}</h1><p className="text-[15px] text-[#71767b]">@{user.username}</p><p className="mt-3 text-[15px]">Создаю, публикую, развиваюсь.</p><div className="mt-3 flex gap-4 text-sm text-[#71767b]"><span><b className="text-white">{posts.length}</b> постов</span><span><b className="text-white">{posts.filter((post) => post.status === "published").length}</b> опубликовано</span></div></section></>}
      {error && <ErrorState message={error} onRetry={() => { setLoading(true); setReloadKey((value) => value + 1); }} />}
      <div className="grid grid-cols-3 border-b border-[#2f3336] text-center text-sm font-bold"><span className="border-b-4 border-[#1d9bf0] py-4">Все</span><span className="py-4 text-[#71767b]">Черновики</span><span className="py-4 text-[#71767b]">Архив</span></div>
      {posts.length === 0 ? <EmptyState title="Пока нет постов" text="Создайте черновик — он появится здесь." /> : posts.map((post) => <PostCard key={post.id} post={post} actions={<div className="mt-4 flex flex-wrap gap-2"><Link href={`/account/posts/${post.id}`} className="rounded-full border border-[#536471] px-4 py-1.5 text-xs font-bold hover:bg-[#181818]">Редактировать</Link>{post.status === "draft" && <button onClick={() => statusAction(post.id, "publish")} className="rounded-full bg-[#1d9bf0] px-4 py-1.5 text-xs font-bold hover:bg-[#1a8cd8]">Опубликовать</button>}{post.status === "published" && <button onClick={() => statusAction(post.id, "archive")} className="rounded-full border border-[#536471] px-4 py-1.5 text-xs font-bold hover:bg-[#181818]">В архив</button>}<button onClick={() => remove(post.id)} className="rounded-full px-4 py-1.5 text-xs font-bold text-[#f4212e] hover:bg-red-950/30">Удалить</button></div>} />)}
    </>
  );
}
