"use client";

import { Modal } from "@/components/ui/Overlay/Modal";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { useAuthModal } from "@/components/features/auth/AuthModalProvider";
import { AnimatePresence } from "framer-motion";

export const AuthModal = () => {
  const { isOpen, closeModal } = useAuthModal();

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal onClose={closeModal} contentClassName="max-w-md w-full">
          <div className="rounded-md border border-outline-variant/10 bg-surface-container-low p-6 shadow-ambient sm:p-8 overflow-y-auto">
            <LoginForm onSuccess={closeModal} />
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

