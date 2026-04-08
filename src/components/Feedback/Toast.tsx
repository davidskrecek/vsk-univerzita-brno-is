"use client";

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { ToastType } from '@/types/feedback';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const config = {
  success: {
    label: 'Úspěch',
    icon: CheckCircle2,
    color: 'text-emerald-300',
    border: 'border-l-emerald-400',
    bgIcon: 'bg-emerald-400/15'
  },
  warning: {
    label: 'Upozornění',
    icon: AlertTriangle,
    color: 'text-amber-300',
    border: 'border-l-amber-400',
    bgIcon: 'bg-amber-400/15'
  },
  error: {
    label: 'Chyba',
    icon: XCircle,
    color: 'text-rose-300',
    border: 'border-l-rose-400',
    bgIcon: 'bg-rose-400/15'
  }
};

export function Toast({ message, type = 'success', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const style = config[type];
  const Icon = style.icon;
  const role = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className="animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <div className={`
        relative flex w-full items-start gap-3 rounded-md border border-outline-variant/15
        bg-surface-container-low p-4 text-on-surface shadow-ambient
        border-l-[4px] ${style.border}
      `}>
        <div className={`flex-shrink-0 p-2 rounded-full ${style.bgIcon} ${style.color}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>

        <div className="flex-1 pt-0.5">
          <h4 className="text-[15px] leading-tight font-bold">
            {style.label}
          </h4>
          <p className="mt-1 text-[14px] leading-snug text-on-surface/70">
            {message}
          </p>
        </div>

        <button
          type="button"
          aria-label="Zavřít notifikaci"
          onClick={onClose}
          className="flex-shrink-0 text-on-surface/35 transition-colors hover:text-on-surface"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
