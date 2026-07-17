"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { apiFetch } from "@/lib/client-api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ username: form.get("username"), password: form.get("password") }) });
      router.push("/account"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Не удалось войти"); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden items-center justify-center bg-[#f2f2f2] text-black lg:flex"><span className="text-[240px] font-black tracking-tighter">P</span></div>
      <div className="flex items-center justify-center px-6 py-12"><div className="w-full max-w-md animate-in">
        <Link href="/" className="mb-12 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl font-black text-black lg:hidden">P</Link>
        <p className="text-sm font-bold text-[#1d9bf0]">С возвращением</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight">Войти в Pulse</h1><p className="mt-3 text-[#71767b]">Продолжите публиковать и читать.</p>
        <form onSubmit={submit} className="mt-10 space-y-5">
          <Field name="username" label="Username или email" autoComplete="username" required />
          <Field name="password" label="Пароль" type="password" autoComplete="current-password" required />
          {error && <p className="rounded-xl bg-red-950/40 p-3 text-sm text-red-300">{error}</p>}
          <button disabled={loading} className="h-12 w-full rounded-full bg-white font-bold text-black transition hover:bg-[#d7dbdc] disabled:opacity-50">{loading ? "Входим…" : "Войти"}</button>
        </form>
        <p className="mt-8 text-sm text-[#71767b]">Нет аккаунта? <Link href="/register" className="text-[#1d9bf0] hover:underline">Зарегистрироваться</Link></p>
      </div></div>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props;
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input {...inputProps} className="h-14 w-full rounded-xl border border-[#536471] bg-transparent px-4 outline-none transition focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0]" /></label>;
}
