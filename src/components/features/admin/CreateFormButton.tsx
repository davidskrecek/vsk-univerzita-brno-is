"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { useSports } from "@/components/features/sports/SportsProvider";
import SectionActionButton from "@/components/ui/Actions/SectionActionButton";

interface CreateFormButtonProps {
  label: string;
  FormComponent: React.ComponentType<{
    sports: Array<{ id: number; name: string }>;
    onCancel: () => void;
    onSuccess: () => void;
  }>;
}

export const CreateFormButton = ({ label, FormComponent }: CreateFormButtonProps) => {
  const { sports } = useSports();
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

      <AnimatePresence>
        {isOpen && (
          <FormComponent sports={availableSports} onCancel={handleClose} onSuccess={handleClose} />
        )}
      </AnimatePresence>
    </>
  );
};

export default CreateFormButton;

