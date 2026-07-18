"use client";

import { useEffect } from "react";

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, onCancel, open]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <div className="modal-panel w-full max-w-sm rounded-3xl border border-[#2f3336] bg-black p-6 shadow-2xl">
        <h2 id="confirm-title" className="text-xl font-extrabold">{title}</h2>
        <p className="mt-2 text-sm leading-5 text-[#a3a3a3]">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-full border border-[#536471] px-5 py-2 text-sm font-bold transition hover:bg-[#181818] disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-full bg-[#f4212e] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#dc1d28] disabled:opacity-50"
          >
            {loading ? "Удаляем…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
