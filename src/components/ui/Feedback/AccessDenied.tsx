"use client";

import React from "react";
import { IoLockClosedOutline } from "react-icons/io5";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  onBack?: () => void;
  className?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = "Přístup odepřen",
  message = "Nemáte dostatečná oprávnění k zobrazení nebo úpravě tohoto obsahu. Pokud si myslíte, že jde o chybu, kontaktujte správce systému.",
  onBack,
  className = "",
}) => {
  return (
    <div className={`p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 ${className}`}>
      <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center text-error animate-in fade-in zoom-in duration-500">
        <IoLockClosedOutline size={40} />
      </div>
      
      <div className="space-y-2 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <h3 className="text-2xl font-display font-bold text-on-surface tracking-tight">
          {title}
        </h3>
        <p className="text-on-surface/60 font-sans leading-relaxed">
          {message}
        </p>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="btn-surface px-8 py-2.5 mt-2 font-display font-bold uppercase tracking-wider text-xs hover:scale-105 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
        >
          Zpět
        </button>
      )}
    </div>
  );
};

export default AccessDenied;

