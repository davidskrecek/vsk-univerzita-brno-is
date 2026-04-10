"use client";

import { Modal } from "@/components/Overlay/Modal";
import { LoginForm } from "@/components/Forms/LoginForm";
import { useAuthModal } from "@/components/Auth/AuthModalProvider";

export const AuthModal = () => {
  const { isOpen, closeModal } = useAuthModal();

  if (!isOpen) return null;

  return (
    <Modal onClose={closeModal} contentClassName="max-w-md w-full">
      <div className="rounded-md border border-outline-variant/10 bg-surface-container-low p-6 shadow-ambient sm:p-8">
        <LoginForm onSuccess={closeModal} />
      </div>
    </Modal>
  );
};
