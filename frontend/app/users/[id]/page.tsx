"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { EmptyState, ErrorState, LoadingFeed } from "@/components/ui-states";
import { apiFetch } from "@/lib/client-api";
import type { PublicPost, PublicUser } from "@/lib/types";

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch<PublicUser>(`/api/users/${id}`),
      apiFetch<PublicPost[]>(`/api/users/${id}/posts?limit=100&offset=0`),
    ])
      .then(([profile, publishedPosts]) => {
        setUser(profile);
        setPosts(publishedPosts);
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <>
        <PageHeader title="Профиль" back />
        <ErrorState message={error} />
      </>
    );
  }

  if (!user) {
    return <LoadingFeed />;
  }

  return (
    <>
      <PageHeader title={user.username} back />
      <div className="h-32 bg-gradient-to-br from-[#0b6aa9] via-[#1d9bf0] to-[#74c8ff]" />
      <section className="border-b border-[#2f3336] px-4 pb-5">
        <div className="-mt-8">
          <span className="inline-flex rounded-full border-4 border-black">
            <Avatar name={user.username} size="lg" />
          </span>
        </div>
        <h1 className="mt-3 text-xl font-extrabold">
          {user.first_name} {user.last_name}
        </h1>
        <p className="text-[15px] text-[#71767b]">@{user.username}</p>
      </section>
      <div className="border-b border-[#2f3336] text-center text-sm font-bold">
        <div className="relative inline-block px-8 py-4">
          Публикации
          <span className="absolute right-6 bottom-0 left-6 h-1 rounded-full bg-[#1d9bf0]" />
        </div>
      </div>
      {posts.length === 0 ? (
        <EmptyState
          title="Пока нет публикаций"
          text="У этого пользователя ещё нет опубликованных постов."
        />
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} author={user} />
        ))
      )}
    </>
  );
}
