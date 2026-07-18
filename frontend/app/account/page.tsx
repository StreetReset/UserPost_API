"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/app-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import { PostCard } from "@/components/post-card";
import { useToast } from "@/components/toast";
import { EmptyState, ErrorState, LoadingFeed } from "@/components/ui-states";
import { apiFetch } from "@/lib/client-api";
import type { Post, PostStatus, User } from "@/lib/types";

const profileTabs: Array<{ value: PostStatus; label: string }> = [
  { value: "published", label: "Опубликованные" },
  { value: "draft", label: "Черновики" },
  { value: "archived", label: "Архив" },
];

const emptyMessages: Record<PostStatus, { title: string; text: string }> = {
  published: {
    title: "Нет опубликованных постов",
    text: "Опубликуйте черновик — после этого он появится здесь.",
  },
  draft: {
    title: "Нет черновиков",
    text: "Создайте новый пост, чтобы продолжить работу позже.",
  },
  archived: {
    title: "Архив пуст",
    text: "Архивированные публикации появятся здесь.",
  },
};

export default function AccountPage() {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<PostStatus>("published");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingAction, setPendingAction] = useState("");
  const [deletePostId, setDeletePostId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      apiFetch<User>("/api/auth/me"),
      apiFetch<Post[]>("/api/me/posts?limit=100&offset=0"),
    ])
      .then(([me, myPosts]) => {
        if (!active) return;
        setUser(me);
        setPosts(myPosts);
        setError("");
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    const restoreFrame = window.requestAnimationFrame(() => {
      const storedTab = window.sessionStorage.getItem(
        "pulse:account:active-tab",
      ) as PostStatus | null;

      if (storedTab && profileTabs.some((tab) => tab.value === storedTab)) {
        setActiveTab(storedTab);
      }

      const scrollPosition = Number(
        window.sessionStorage.getItem("pulse:account:scroll") ?? 0,
      );
      window.scrollTo({ top: scrollPosition });
    });

    function saveScrollPosition() {
      window.sessionStorage.setItem(
        "pulse:account:scroll",
        String(window.scrollY),
      );
    }

    window.addEventListener("scroll", saveScrollPosition, { passive: true });

    return () => {
      window.cancelAnimationFrame(restoreFrame);
      window.removeEventListener("scroll", saveScrollPosition);
      saveScrollPosition();
    };
  }, []);

  function selectTab(tab: PostStatus) {
    setActiveTab(tab);
    window.sessionStorage.setItem("pulse:account:active-tab", tab);
  }

  async function statusAction(id: number, action: "publish" | "archive") {
    const actionKey = `${action}:${id}`;
    setPendingAction(actionKey);
    setError("");

    try {
      await apiFetch(`/api/me/posts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });

      const nextTab = action === "publish" ? "published" : "archived";
      selectTab(nextTab);
      setReloadKey((value) => value + 1);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось изменить статус";
      setError(message);
      showToast(message, "error");
    } finally {
      setPendingAction("");
    }
  }

  async function removePost() {
    if (deletePostId === null) return;

    const actionKey = `delete:${deletePostId}`;
    setPendingAction(actionKey);
    setError("");

    try {
      await apiFetch(`/api/me/posts/${deletePostId}`, { method: "DELETE" });
      setPosts((items) => items.filter((post) => post.id !== deletePostId));
      setDeletePostId(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось удалить пост";
      setError(message);
      showToast(message, "error");
    } finally {
      setPendingAction("");
    }
  }

  if (loading) return <LoadingFeed />;

  if (error && !user) {
    return (
      <>
        <div className="border-b border-[#2f3336] p-5 text-xl font-bold">
          Профиль
        </div>
        <ErrorState message={error} />
        <div className="px-4">
          <Link
            href="/login"
            className="rounded-full bg-white px-5 py-2 font-bold text-black"
          >
            Войти
          </Link>
        </div>
      </>
    );
  }

  const visiblePosts = posts.filter((post) => post.status === activeTab);
  const emptyMessage = emptyMessages[activeTab];

  return (
    <>
      {user && (
        <>
          <div className="h-32 bg-gradient-to-br from-[#0b6aa9] via-[#1d9bf0] to-[#74c8ff]" />
          <section className="border-b border-[#2f3336] px-4 pb-4">
            <div className="-mt-8 flex items-end justify-between">
              <span className="rounded-full border-4 border-black">
                <Avatar name={user.username} size="lg" />
              </span>
              <Link
                href="/account/posts/new"
                className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black hover:bg-[#d7dbdc]"
              >
                Новый пост
              </Link>
            </div>
            <h1 className="mt-3 text-xl font-extrabold">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-[15px] text-[#71767b]">@{user.username}</p>
            <p className="mt-3 text-[15px]">Создаю, публикую, развиваюсь.</p>
            <div className="mt-3 flex gap-4 text-sm text-[#71767b]">
              <span><b className="text-white">{posts.length}</b> постов</span>
              <span>
                <b className="text-white">
                  {posts.filter((post) => post.status === "published").length}
                </b>{" "}
                опубликовано
              </span>
            </div>
          </section>
        </>
      )}

      {error && (
        <ErrorState
          message={error}
          onRetry={() => {
            setLoading(true);
            setReloadKey((value) => value + 1);
          }}
        />
      )}

      <div className="grid grid-cols-3 border-b border-[#2f3336] text-center text-sm font-bold">
        {profileTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => selectTab(tab.value)}
            className={`relative px-1 py-4 text-xs transition hover:bg-[#080808] sm:text-sm ${
              activeTab === tab.value ? "text-white" : "text-[#71767b]"
            }`}
          >
            {tab.label}
            {activeTab === tab.value && (
              <span className="tab-indicator absolute right-[25%] bottom-0 left-[25%] h-1 rounded-full bg-[#1d9bf0]" />
            )}
          </button>
        ))}
      </div>

      {visiblePosts.length === 0 ? (
        <EmptyState title={emptyMessage.title} text={emptyMessage.text} />
      ) : (
        visiblePosts.map((post) => {
          const publishKey = `publish:${post.id}`;
          const archiveKey = `archive:${post.id}`;
          const deleteKey = `delete:${post.id}`;

          return (
            <PostCard
              key={post.id}
              post={post}
              author={user ?? undefined}
              actions={
                <div className="mt-4 grid w-full max-w-[420px] grid-cols-3 gap-2">
                  <Link
                    href={`/account/posts/${post.id}`}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[#536471] px-2 text-sm font-semibold hover:bg-[#181818]"
                  >
                    Редактировать
                  </Link>
                  {post.status === "draft" && (
                    <button
                      disabled={pendingAction === publishKey}
                      onClick={() => statusAction(post.id, "publish")}
                      className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[#1d9bf0] bg-[#1d9bf0] px-2 text-sm font-semibold hover:bg-[#1a8cd8] disabled:opacity-50"
                    >
                      {pendingAction === publishKey
                        ? "Публикуем…"
                        : "Опубликовать"}
                    </button>
                  )}
                  {post.status === "published" && (
                    <button
                      disabled={pendingAction === archiveKey}
                      onClick={() => statusAction(post.id, "archive")}
                      className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[#536471] px-2 text-sm font-semibold hover:bg-[#181818] disabled:opacity-50"
                    >
                      {pendingAction === archiveKey
                        ? "Архивируем…"
                        : "В архив"}
                    </button>
                  )}
                  <button
                    disabled={pendingAction === deleteKey}
                    onClick={() => setDeletePostId(post.id)}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-red-900/70 px-2 text-sm font-semibold text-[#f4212e] hover:bg-red-950/30 disabled:opacity-50"
                  >
                    Удалить
                  </button>
                </div>
              }
            />
          );
        })
      )}

      <ConfirmModal
        open={deletePostId !== null}
        title="Удалить пост?"
        description="Пост исчезнет из профиля. Отменить это действие через интерфейс не получится."
        confirmLabel="Удалить"
        loading={
          deletePostId !== null &&
          pendingAction === `delete:${deletePostId}`
        }
        onConfirm={removePost}
        onCancel={() => setDeletePostId(null)}
      />
    </>
  );
}
