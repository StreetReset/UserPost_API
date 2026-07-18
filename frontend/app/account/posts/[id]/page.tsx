"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { PostEditor } from "@/components/post-editor";
import { useToast } from "@/components/toast";
import { ErrorState, LoadingFeed } from "@/components/ui-states";
import { apiFetch } from "@/lib/client-api";
import type { Post } from "@/lib/types";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  function goBack() {
    if (!dirty || window.confirm("Уйти без сохранения изменений?")) {
      router.back();
    }
  }

  useEffect(() => {
    apiFetch<Post[]>("/api/me/posts?limit=100&offset=0")
      .then((posts) => {
        const found = posts.find((item) => item.id === Number(id));
        if (!found) throw new Error("Пост не найден");
        setPost(found);
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  async function updatePost(data: { title: string; content: string }) {
    setLoading(true);
    setError("");

    try {
      await apiFetch(`/api/me/posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      router.push("/account");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось обновить пост";
      setError(message);
      showToast(message, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  if (!post && !error) return <LoadingFeed />;

  if (!post) {
    return (
      <>
        <PageHeader title="Редактирование" back onBack={goBack} />
        <ErrorState message={error} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Редактирование" back onBack={goBack} />
      {post.status === "published" && (
        <div className="border-b border-[#2f3336] px-4 py-3 text-right">
          <Link
            href={`/posts/${post.id}`}
            className="text-sm font-bold text-[#1d9bf0] hover:underline"
          >
            Посмотреть публикацию
          </Link>
        </div>
      )}
      <PostEditor
        initialTitle={post.title}
        initialContent={post.content}
        storageKey={`pulse:edit-post:${post.id}`}
        submitLabel="Сохранить"
        submittingLabel="Сохраняем…"
        submitting={loading}
        error={error}
        onSubmit={updatePost}
        onDirtyChange={setDirty}
      />
    </>
  );
}
