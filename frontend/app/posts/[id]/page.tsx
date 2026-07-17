"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { ErrorState, LoadingFeed } from "@/components/ui-states";
import { apiFetch } from "@/lib/client-api";
import type { PublicPost } from "@/lib/types";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PublicPost | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<PublicPost>(`/api/posts/${id}`).then(setPost).catch((err: Error) => setError(err.message));
  }, [id]);

  return <><PageHeader title="Публикация" back />{error ? <ErrorState message={error} /> : post ? <PostCard post={post} /> : <LoadingFeed />}</>;
}
