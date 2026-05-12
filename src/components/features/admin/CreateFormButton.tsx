"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
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
          <FormComponent sports={sports} onCancel={handleClose} onSuccess={handleClose} />
        )}
      </AnimatePresence>
    </>
  );
};

export default CreateFormButton;

