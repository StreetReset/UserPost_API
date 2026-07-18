"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const TITLE_LIMIT = 100;

interface StoredDraft {
  title: string;
  content: string;
}

export function PostEditor({
  initialTitle = "",
  initialContent = "",
  storageKey,
  submitLabel,
  submittingLabel,
  submitting,
  error,
  onSubmit,
  onDirtyChange,
}: {
  initialTitle?: string;
  initialContent?: string;
  storageKey: string;
  submitLabel: string;
  submittingLabel: string;
  submitting: boolean;
  error?: string;
  onSubmit: (data: StoredDraft) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const initialValue = useMemo(
    () => ({ title: initialTitle, content: initialContent }),
    [initialContent, initialTitle],
  );
  const dirty =
    title !== initialValue.title || content !== initialValue.content;

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return;

      try {
        const draft = JSON.parse(stored) as StoredDraft;
        if (draft.title || draft.content) {
          setTitle(draft.title);
          setContent(draft.content);
          setSavedLocally(true);
          onDirtyChange?.(true);
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, [onDirtyChange, storageKey]);

  useEffect(() => {
    if (!dirty) return;

    const timer = window.setTimeout(() => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ title, content }),
      );
      setSavedLocally(true);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [content, dirty, storageKey, title]);

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await onSubmit({ title: title.trim(), content: content.trim() });
      window.localStorage.removeItem(storageKey);
      onDirtyChange?.(false);
    } catch {
      // Родитель показывает ошибку и toast; локальную копию сохраняем.
    }
  }

  return (
    <form onSubmit={submit} className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-[#71767b]">
          {dirty
            ? savedLocally
              ? "Сохранено локально"
              : "Сохраняем локально…"
            : "Изменений нет"}
        </p>
        <button
          type="button"
          onClick={() => setPreview((value) => !value)}
          className="rounded-full border border-[#536471] px-4 py-1.5 text-xs font-bold transition hover:bg-[#181818]"
        >
          {preview ? "Продолжить редактирование" : "Предпросмотр"}
        </button>
      </div>

      {preview ? (
        <article className="preview-enter min-h-[380px] rounded-2xl border border-[#2f3336] p-5">
          <p className="text-xs font-bold text-[#1d9bf0]">Предпросмотр</p>
          <h2 className="mt-3 break-words text-2xl font-extrabold">
            {title || "Заголовок поста"}
          </h2>
          <p className="mt-4 whitespace-pre-wrap break-words text-[16px] leading-7 text-[#e7e9ea]">
            {content || "Здесь появится текст публикации."}
          </p>
        </article>
      ) : (
        <>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setSavedLocally(false);
              onDirtyChange?.(true);
            }}
            maxLength={TITLE_LIMIT}
            required
            autoFocus
            placeholder="Заголовок"
            className="w-full border-b border-[#2f3336] bg-transparent py-4 text-2xl font-bold outline-none placeholder:text-[#536471]"
          />
          <div className="mt-1 text-right text-xs text-[#71767b]">
            {title.length}/{TITLE_LIMIT}
          </div>
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setSavedLocally(false);
              onDirtyChange?.(true);
            }}
            required
            placeholder="Что происходит?"
            className="mt-3 min-h-[320px] w-full resize-y bg-transparent text-lg leading-7 outline-none placeholder:text-[#536471]"
          />
          <div className="text-right text-xs text-[#71767b]">
            {content.length} символов
          </div>
        </>
      )}

      {error && (
        <p className="my-4 rounded-xl border border-red-900/60 bg-red-950/20 p-3 text-sm text-red-300">
          {error}
        </p>
      )}
      <div className="mt-4 flex justify-end border-t border-[#2f3336] pt-4">
        <button
          disabled={submitting || !title.trim() || !content.trim()}
          className="rounded-full bg-[#1d9bf0] px-6 py-2.5 font-bold transition hover:bg-[#1a8cd8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
