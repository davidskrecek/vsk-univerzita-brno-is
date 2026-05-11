"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/Overlay/Modal";
import SectionActionButton from "@/components/ui/Actions/SectionActionButton";

interface CreateFormButtonProps {
  label: string;
  FormComponent: React.ComponentType<{
    sports: Array<{ id: number; name: string }>;
    onCancel: () => void;
    onSuccess: () => void;
  }>;
  sports: Array<{ id: number; name: string }>;
  requiredPermission?: string;
}

export const CreateFormButton = ({ label, FormComponent, sports, requiredPermission }: CreateFormButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <SectionActionButton
        label={label}
        onClick={() => setIsOpen(true)}
        requiredPermission={requiredPermission}
      />

      <AnimatePresence>
        {isOpen && (
          <Modal onClose={handleClose} contentClassName="max-w-4xl w-full">
            <FormComponent sports={sports} onCancel={handleClose} onSuccess={handleClose} />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreateFormButton;

