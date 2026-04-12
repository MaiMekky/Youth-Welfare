"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Simple event emitter for non-component usage
export const toastEvent = {
  listeners: [] as ((message: string, type: ToastType) => void)[],
  subscribe(fn: (message: string, type: ToastType) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  },
  emit(message: string, type: ToastType) {
    this.listeners.forEach((l) => l(message, type));
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  // Subscribe to external events
  React.useEffect(() => {
    return toastEvent.subscribe((msg, type) => showToast(msg, type));
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="global-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`global-toast global-toast-${t.type}`}>
            <div className="global-toast-icon">
              {t.type === "success" && <CheckCircle size={20} />}
              {t.type === "error" && <AlertCircle size={20} />}
              {t.type === "info" && <Info size={20} />}
              {t.type === "warning" && <AlertTriangle size={20} />}
            </div>
            <div className="global-toast-message">{t.message}</div>
            <button className="global-toast-close" onClick={() => removeToast(t.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .global-toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 999999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }
        .global-toast {
          pointer-events: auto;
          min-width: 300px;
          max-width: 450px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideIn 0.3s ease-out;
          border-right: 6px solid #e2e8f0;
          direction: rtl;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .global-toast-success { border-right-color: #22c55e; }
        .global-toast-error { border-right-color: #ef4444; }
        .global-toast-warning { border-right-color: #f59e0b; }
        .global-toast-info { border-right-color: #3b82f6; }

        .global-toast-icon { display: flex; align-items: center; }
        .global-toast-success .global-toast-icon { color: #22c55e; }
        .global-toast-error .global-toast-icon { color: #ef4444; }
        .global-toast-warning .global-toast-icon { color: #f59e0b; }
        .global-toast-info .global-toast-icon { color: #3b82f6; }

        .global-toast-message {
          flex: 1;
          font-weight: 700;
          font-size: 14px;
          color: #1e293b;
        }
        .global-toast-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .global-toast-close:hover { color: #1e293b; }
      `}</style>
    </ToastContext.Provider>
  );
}
