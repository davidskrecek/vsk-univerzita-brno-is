"use client";

import { useEffect } from "react";
import { motion, usePresence } from "framer-motion";

interface ModalProps {
  children: React.ReactNode;
  onClose?: () => void;
  contentClassName?: string;
  className?: string;
}

export const Modal = ({ children, onClose, contentClassName = "", className = "" }: ModalProps) => {
  const [isPresent] = usePresence();

  useEffect(() => {
    const style = document.body.style;
    const initialOverflow = style.overflow;

    if (isPresent) {
      style.overflow = 'hidden';
    } else {
      style.overflow = initialOverflow;
    }

    return () => {
      style.overflow = initialOverflow;
    };
  }, [isPresent]);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center ${!isPresent ? "pointer-events-none" : ""}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        className={`relative w-full h-full flex items-center justify-center overflow-y-auto p-4 sm:p-6 md:p-10 ${className}`}
        style={{ scrollbarGutter: 'stable both-edges' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 500,
            opacity: { duration: 0.12 }
          }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-h-fit flex flex-col ${contentClassName}`}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default Modal;

