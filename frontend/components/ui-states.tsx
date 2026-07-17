export function LoadingFeed() {
  return <div>{[0, 1, 2].map((item) => <div key={item} className="flex gap-3 border-b border-[#2f3336] p-4"><div className="h-10 w-10 animate-pulse rounded-full bg-[#16181c]" /><div className="flex-1"><div className="h-4 w-36 animate-pulse rounded bg-[#16181c]" /><div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-[#16181c]" /><div className="mt-2 h-4 w-3/5 animate-pulse rounded bg-[#16181c]" /></div></div>)}</div>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="mx-auto max-w-sm px-8 py-20 text-center"><h2 className="text-2xl font-extrabold">{title}</h2><p className="mt-2 text-[15px] leading-5 text-[#71767b]">{text}</p></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="mx-4 my-6 rounded-2xl border border-red-900/60 bg-red-950/20 p-5"><p className="font-bold text-red-300">Что-то пошло не так</p><p className="mt-1 text-sm text-red-300/70">{message}</p>{onRetry && <button onClick={onRetry} className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-bold text-black">Повторить</button>}</div>;
}
