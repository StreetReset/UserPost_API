"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { EmptyState, ErrorState, LoadingFeed } from "@/components/ui-states";
import { apiFetch } from "@/lib/client-api";
import type { PublicPost } from "@/lib/types";

const PAGE_SIZE = 20;

export default function Home() {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    apiFetch<PublicPost[]>(`/api/posts?limit=${PAGE_SIZE}&offset=${offset}`)
      .then((nextPosts) => { if (active) { setPosts(nextPosts); setError(""); } })
      .catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [offset, reloadKey]);

  return (
    <>
      <PageHeader title="Главная" />
      <div className="grid grid-cols-2 border-b border-[#2f3336] text-center text-sm font-medium">
        <div className="relative py-4 font-bold">Для вас<span className="absolute right-[30%] bottom-0 left-[30%] h-1 rounded-full bg-[#1d9bf0]" /></div>
        <div className="py-4 text-[#71767b]">Подписки</div>
      </div>
      {loading ? <LoadingFeed /> : error ? <ErrorState message={error} onRetry={() => { setLoading(true); setReloadKey((value) => value + 1); }} /> : posts.length === 0 ? <EmptyState title="Пока тихо" text="Опубликованные посты появятся здесь. Самое время написать первый." /> : posts.map((post) => <PostCard key={post.id} post={post} />)}
      {!loading && !error && posts.length > 0 && (
        <div className="flex items-center justify-between border-t border-[#2f3336] p-4">
          <button disabled={offset === 0} onClick={() => { setLoading(true); setOffset((value) => Math.max(0, value - PAGE_SIZE)); }} className="rounded-full border border-[#536471] px-5 py-2 text-sm font-bold transition hover:bg-[#181818] disabled:cursor-not-allowed disabled:opacity-40">Назад</button>
          <span className="text-sm text-[#71767b]">Страница {offset / PAGE_SIZE + 1}</span>
          <button disabled={posts.length < PAGE_SIZE} onClick={() => { setLoading(true); setOffset((value) => value + PAGE_SIZE); }} className="rounded-full border border-[#536471] px-5 py-2 text-sm font-bold transition hover:bg-[#181818] disabled:cursor-not-allowed disabled:opacity-40">Дальше</button>
        </div>
      )}
    </>
  );
}
