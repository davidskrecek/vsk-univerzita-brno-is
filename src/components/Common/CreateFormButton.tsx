"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/Overlay/Modal";
import SectionActionButton from "@/components/Common/SectionActionButton";

interface CreateFormButtonProps {
  label: string;
  FormComponent: React.ComponentType<{
    sports: Array<{ id: number; name: string }>;
    onCancel: () => void;
    onSuccess: () => void;
  }>;
  sports: Array<{ id: number; name: string }>;
}

export const CreateFormButton = ({ label, FormComponent, sports }: CreateFormButtonProps) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const availableSports =
    session?.user?.role === "superadmin"
      ? sports
      : sports.filter((sport) => session?.user?.managedSportIds?.includes(sport.id));

  if (!availableSports.length) {
    return null;
  }

  return (
    <>
      <SectionActionButton
        label={label}
        onClick={() => setIsOpen(true)}
        requiredRoles={["sport_manager", "superadmin"]}
      />

      {isOpen ? (
        <Modal onClose={handleClose} contentClassName="max-w-4xl w-full">
          <FormComponent sports={availableSports} onCancel={handleClose} onSuccess={handleClose} />
        </Modal>
      ) : null}
    </>
  );
};

export default CreateFormButton;
