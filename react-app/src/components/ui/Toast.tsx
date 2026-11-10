import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createId } from '../../lib/id';

interface ToastItem {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  notify: (message: string, action?: { label: string; run: () => void }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, action?: { label: string; run: () => void }) => {
      const id = createId('toast');
      setItems((current) => [
        ...current.slice(-2),
        { id, message, actionLabel: action?.label, onAction: action?.run },
      ]);
      globalThis.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className="card pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3 shadow-lg"
          >
            <span className="text-sm text-ink">{item.message}</span>
            <div className="flex items-center gap-1">
              {item.actionLabel ? (
                <button
                  type="button"
                  className="btn btn-soft btn-sm"
                  onClick={() => {
                    item.onAction?.();
                    dismiss(item.id);
                  }}
                >
                  {item.actionLabel}
                </button>
              ) : null}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => dismiss(item.id)}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
