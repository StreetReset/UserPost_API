import Link from "next/link";

import type { Post, PublicPost, PublicUser } from "@/lib/types";
import { Avatar } from "./app-shell";
import { HeartIcon, MessageIcon, RepeatIcon, ShareIcon } from "./icons";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru", { day: "numeric", month: "short" }).format(new Date(value));
}

function wasUpdated(post: PublicPost | Post) {
  return (
    new Date(post.updated_at).getTime() -
      new Date(post.created_at).getTime() >
    1000
  );
}

export function PostCard({
  post,
  author: authorOverride,
  actions,
}: {
  post: PublicPost | Post;
  author?: PublicUser;
  actions?: React.ReactNode;
}) {
  const status = "status" in post ? post.status : null;
  const author = post.author ?? authorOverride;
  const authorName = author
    ? `${author.first_name} ${author.last_name}`
    : `Автор #${post.author_id}`;
  const username = author ? `@${author.username}` : `@user_${post.author_id}`;
  const profileHref = `/users/${author?.id ?? post.author_id}`;

  return (
    <article className="post-enter relative border-b border-[#2f3336] px-4 py-3 transition hover:bg-[rgba(255,255,255,0.025)]">
      {status && (
        <span className={`absolute top-3 right-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status === "published" ? "border-[#1d9bf0]/60 bg-[#1d9bf0]/10 text-[#1d9bf0]" : status === "archived" ? "border-[#71767b]/50 bg-[#16181c] text-[#a3a3a3]" : "border-amber-500/50 bg-amber-500/10 text-amber-400"}`}>
          {status === "draft" ? "Черновик" : status === "published" ? "Опубликован" : "В архиве"}
        </span>
      )}
      <div className="flex gap-3">
        <Link href={profileHref} aria-label={`Профиль ${authorName}`}>
          <Avatar name={author?.username ?? authorName} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className={`flex min-w-0 items-center gap-1 text-[15px] ${status ? "pr-28" : ""}`}>
            <Link href={profileHref} className="truncate font-bold hover:underline">{authorName}</Link>
            <Link href={profileHref} className="truncate text-[#71767b] hover:underline">{username}</Link>
            <span className="hidden text-[#71767b] sm:inline">·</span>
            <span className="hidden whitespace-nowrap text-[#71767b] sm:inline">{formatDate(post.created_at)}</span>
          </div>
          <Link href={`/posts/${post.id}`} className="block">
            <h2 className="mt-1 text-[17px] font-bold leading-5">{post.title}</h2>
            <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-[15px] leading-5.5 text-[#e7e9ea]">{post.content}</p>
          </Link>
          {wasUpdated(post) && (
            <p className="mt-2 text-xs text-[#71767b]">
              Изменено {formatDate(post.updated_at)}
            </p>
          )}
          {actions ?? (
            <div className="mt-3 flex max-w-[420px] items-center justify-between text-[#71767b]">
              {[MessageIcon, RepeatIcon, HeartIcon, ShareIcon].map((ActionIcon, index) => (
                <button key={index} className="rounded-full p-2 transition hover:bg-[rgba(29,155,240,.12)] hover:text-[#1d9bf0]"><ActionIcon className="h-[18px] w-[18px]" /></button>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
