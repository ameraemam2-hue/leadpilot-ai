"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";
interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastCtx {
  toast: (t: Omit<Toast, "id">) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`lp-card p-4 flex items-start gap-3 animate-slide-up shadow-2xl ${
              t.variant === "error"
                ? "border-[#ff4757]/40"
                : t.variant === "success"
                ? "border-[#22d17a]/40"
                : "border-[#00d4ff]/40"
            }`}
          >
            {t.variant === "success" && (
              <CheckCircle2 className="w-5 h-5 text-[#22d17a] flex-shrink-0 mt-0.5" />
            )}
            {t.variant === "error" && (
              <AlertCircle className="w-5 h-5 text-[#ff4757] flex-shrink-0 mt-0.5" />
            )}
            {t.variant === "info" && (
              <CheckCircle2 className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{t.title}</div>
              {t.description && (
                <div className="text-xs text-[#7a8099] mt-0.5">
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-[#7a8099] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
