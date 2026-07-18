"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "./icons";

export function PageHeader({
  title,
  back = false,
  subtitle,
  onBack,
}: {
  title: string;
  back?: boolean;
  subtitle?: string;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <header className="glass-header sticky top-0 z-20 flex min-h-14 items-center gap-6 border-b border-[#2f3336] px-4">
      {back && (
        <button onClick={() => onBack ? onBack() : router.back()} className="focus-ring -ml-2 rounded-full p-2 transition hover:bg-[#181818]" aria-label="Назад">
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
      )}
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-xs text-[#71767b]">{subtitle}</p>}
      </div>
    </header>
  );
}
