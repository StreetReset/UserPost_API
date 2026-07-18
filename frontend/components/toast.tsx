"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message, kind }]);

    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed right-4 bottom-24 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 md:bottom-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-enter rounded-2xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur ${
              toast.kind === "success"
                ? "border-emerald-700/60 bg-emerald-950/90 text-emerald-100"
                : toast.kind === "error"
                  ? "border-red-800/60 bg-red-950/90 text-red-100"
                  : "border-[#536471] bg-[#16181c]/95 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
