"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/client-api";
import type { User } from "@/lib/types";
import { HomeIcon, LoginIcon, LogoutIcon, PenIcon, UserIcon } from "./icons";

const nav = [
  { href: "/", label: "Главная", icon: HomeIcon },
  { href: "/account", label: "Профиль", icon: UserIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    apiFetch<User>("/api/auth/me").then(setUser).catch(() => setUser(null));
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (isAuthPage) {
    return <main className="min-h-screen bg-black">{children}</main>;
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[995px] md:grid md:grid-cols-[88px_minmax(0,1fr)] xl:grid-cols-[275px_minmax(0,720px)]">
      <aside className="fixed bottom-0 z-50 w-full border-t border-[#2f3336] bg-black pb-[env(safe-area-inset-bottom)] md:sticky md:top-0 md:h-screen md:w-auto md:border-r md:border-t-0 md:pb-0">
        <div className="flex h-full items-center justify-around px-2 md:flex-col md:items-stretch md:justify-start md:px-3 xl:px-4">
          <Link href="/" className="hidden h-14 w-14 items-center justify-center md:flex" aria-label="Pulse">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-black text-black">P</span>
          </Link>
          <nav className="flex w-full items-center justify-around md:block">
            {nav.map(({ href, label, icon: NavIcon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className="group flex py-2 md:py-1">
                  <span className={`flex items-center gap-5 rounded-full px-3 py-3 transition group-hover:bg-[#181818] ${active ? "font-bold" : "font-normal"}`}>
                    <NavIcon className="h-7 w-7" />
                    <span className="hidden text-xl xl:block">{label}</span>
                  </span>
                </Link>
              );
            })}
            {user ? (
              <button onClick={logout} className="group flex py-2 text-left md:py-1">
                <span className="flex items-center gap-5 rounded-full px-3 py-3 transition group-hover:bg-[#181818]">
                  <LogoutIcon className="h-7 w-7" />
                  <span className="hidden text-xl xl:block">Выйти</span>
                </span>
              </button>
            ) : (
              <Link href="/login" className="group flex py-2 md:py-1">
                <span className="flex items-center gap-5 rounded-full px-3 py-3 transition group-hover:bg-[#181818]">
                  <LoginIcon className="h-7 w-7" />
                  <span className="hidden text-xl xl:block">Войти</span>
                </span>
              </Link>
            )}
          </nav>
          <Link href={user ? "/account/posts/new" : "/login"} className="mt-4 hidden h-13 items-center justify-center rounded-full bg-[#eff3f4] font-bold text-black transition hover:bg-[#d7dbdc] md:flex xl:w-[225px]">
            <PenIcon className="h-6 w-6 xl:hidden" />
            <span className="hidden xl:inline">Написать</span>
          </Link>
          {user && (
            <Link href="/account" className="mt-auto mb-3 hidden items-center gap-3 rounded-full p-3 transition hover:bg-[#181818] md:flex">
              <Avatar name={user.username} />
              <div className="hidden min-w-0 xl:block">
                <p className="truncate text-sm font-bold">{user.first_name} {user.last_name}</p>
                <p className="truncate text-sm text-[#71767b]">@{user.username}</p>
              </div>
            </Link>
          )}
        </div>
      </aside>

      <main className="min-w-0 min-h-screen border-[#2f3336] pb-20 md:border-r md:pb-0">
        <div key={pathname} className="page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const classes = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-9 w-9 text-sm" : "h-10 w-10 text-sm";
  const hue = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  return (
    <span className={`${classes} flex shrink-0 items-center justify-center rounded-full font-bold text-white`} style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 48%), hsl(${(hue + 55) % 360} 70% 38%))` }}>
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
