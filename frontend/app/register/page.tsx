"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthBrand } from "@/components/auth-brand";
import { apiFetch } from "@/lib/client-api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(["username", "email", "password", "birth_date", "first_name", "last_name"].map((key) => [key, form.get(key)]));
    try { await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(body) }); router.push("/login"); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось зарегистрироваться"); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.9fr)_minmax(560px,1.1fr)]">
      <AuthBrand />
      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl animate-in">
          <div className="flex justify-end">
            <Link href="/login" className="rounded-full border border-[#536471] px-5 py-2 text-sm font-bold hover:bg-[#181818]">Войти</Link>
          </div>
          <p className="mt-10 text-sm font-bold text-[#1d9bf0]">Новый аккаунт</p><h1 className="mt-2 text-4xl font-extrabold">Присоединиться к Pulse</h1><p className="mt-3 text-[#71767b]">Пара минут — и можно публиковать.</p>
          <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <Input name="first_name" label="Имя" required /><Input name="last_name" label="Фамилия" required />
            <Input name="username" label="Username" required minLength={3} /><Input name="email" label="Email" type="email" required />
            <Input name="birth_date" label="Дата рождения" type="date" required /><Input name="password" label="Пароль" type="password" minLength={8} required />
            {error && <p className="rounded-xl bg-red-950/40 p-3 text-sm text-red-300 sm:col-span-2">{error}</p>}
            <button disabled={loading} className="h-12 rounded-full bg-white font-bold text-black transition hover:bg-[#d7dbdc] disabled:opacity-50 sm:col-span-2">{loading ? "Создаём аккаунт…" : "Создать аккаунт"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return <label><span className="mb-2 block text-sm font-bold">{label}</span><input {...rest} className="h-13 w-full rounded-xl border border-[#536471] bg-transparent px-4 outline-none transition focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0]" /></label>;
}
