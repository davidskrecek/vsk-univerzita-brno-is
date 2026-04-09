"use client";

import { useEffect } from "react";

interface ModalProps {
  children: React.ReactNode;
  onClose?: () => void;
  contentClassName?: string;
  className?: string;
}

let activeModalLocks = 0;
let lockedScrollY = 0;

export const Modal = ({ children, onClose, contentClassName = "", className = "" }: ModalProps) => {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyTouchAction = body.style.touchAction;
    const previousHtmlOverscrollBehavior = html.style.overscrollBehavior;

    if (activeModalLocks === 0) {
      lockedScrollY = window.scrollY;
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${lockedScrollY}px`;
      body.style.width = "100%";
      body.style.touchAction = "none";
      html.style.overscrollBehavior = "none";
    }

    activeModalLocks += 1;

    return () => {
      activeModalLocks = Math.max(0, activeModalLocks - 1);

      if (activeModalLocks === 0) {
        body.style.overflow = previousBodyOverflow;
        body.style.position = previousBodyPosition;
        body.style.top = previousBodyTop;
        body.style.width = previousBodyWidth;
        body.style.touchAction = previousBodyTouchAction;
        html.style.overscrollBehavior = previousHtmlOverscrollBehavior;
        window.scrollTo(0, lockedScrollY);
      }
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6 md:p-10 ${className}`}>
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;

