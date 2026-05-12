"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { useSports } from "@/components/features/sports/SportsProvider";
import SectionActionButton from "@/components/ui/Actions/SectionActionButton";
import { sessionHasPermission } from "@/lib/permissions";

interface CreateFormButtonProps {
  label: string;
  requiredPermission: string;
  FormComponent: React.ComponentType<{
    sports: Array<{ id: number; name: string }>;
    onCancel: () => void;
    onSuccess: () => void;
  }>;
}

export const CreateFormButton = ({ label, requiredPermission, FormComponent }: CreateFormButtonProps) => {
  const { sports } = useSports();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const availableSports =
    sessionHasPermission(session, "sports:manage")
      ? sports
      : sports.filter((sport) => session?.user?.managedSportIds?.includes(sport.id));

  if (!availableSports.length) {
    return null;
  }

  return (
    <>
      <SectionActionButton
        label={label}
        requiredPermission={requiredPermission}
        onClick={() => setIsOpen(true)}
      />

      <AnimatePresence>
        {isOpen && (
          <FormComponent
            sports={availableSports}
            onCancel={handleClose}
            onSuccess={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CreateFormButton;
