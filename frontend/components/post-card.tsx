import Link from "next/link";

import type { Post, PublicPost } from "@/lib/types";
import { Avatar } from "./app-shell";
import { HeartIcon, MessageIcon, MoreIcon, RepeatIcon, ShareIcon } from "./icons";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru", { day: "numeric", month: "short" }).format(new Date(value));
}

export function PostCard({ post, actions }: { post: PublicPost | Post; actions?: React.ReactNode }) {
  const status = "status" in post ? post.status : null;
  return (
    <article className="animate-in border-b border-[#2f3336] px-4 py-3 transition hover:bg-[rgba(255,255,255,0.025)]">
      <div className="flex gap-3">
        <Avatar name={`user${post.author_id}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[15px]">
            <span className="truncate font-bold hover:underline">Автор #{post.author_id}</span>
            <span className="truncate text-[#71767b]">@user_{post.author_id}</span>
            <span className="text-[#71767b]">·</span>
            <span className="whitespace-nowrap text-[#71767b]">{formatDate(post.created_at)}</span>
            <button className="ml-auto rounded-full p-1.5 text-[#71767b] transition hover:bg-[rgba(29,155,240,.12)] hover:text-[#1d9bf0]" aria-label="Ещё"><MoreIcon className="h-5 w-5" /></button>
          </div>
          <Link href={`/posts/${post.id}`} className="block">
            <h2 className="mt-1 text-[17px] font-bold leading-5">{post.title}</h2>
            <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-[15px] leading-5.5 text-[#e7e9ea]">{post.content}</p>
          </Link>
          {status && <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${status === "published" ? "border-[#1d9bf0]/40 bg-[#1d9bf0]/10 text-[#1d9bf0]" : status === "archived" ? "border-[#71767b]/40 text-[#71767b]" : "border-amber-500/40 bg-amber-500/10 text-amber-400"}`}>{status === "draft" ? "Черновик" : status === "published" ? "Опубликован" : "В архиве"}</span>}
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
