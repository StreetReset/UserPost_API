"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { PostEditor } from "@/components/post-editor";
import { useToast } from "@/components/toast";
import { apiFetch } from "@/lib/client-api";

export default function NewPostPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  function goBack() {
    if (!dirty || window.confirm("Уйти со страницы? Черновик сохранён локально.")) {
      router.back();
    }
  }

  async function createDraft(data: { title: string; content: string }) {
    setLoading(true);
    setError("");

    try {
      await apiFetch("/api/me/posts", {
        method: "POST",
        body: JSON.stringify(data),
      });
      router.push("/account");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось сохранить черновик";
      setError(message);
      showToast(message, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Новый черновик" back onBack={goBack} />
      <PostEditor
        storageKey="pulse:new-post-draft"
        submitLabel="Сохранить черновик"
        submittingLabel="Сохраняем…"
        submitting={loading}
        error={error}
        onSubmit={createDraft}
        onDirtyChange={setDirty}
      />
    </>
  );
}
