"use client";

import { useSession } from "next-auth/react";
import AppButton from "@/components/Common/AppButton";

interface SectionActionButtonProps {
  label: string;
  onClick: () => void;
  requiredRoles?: string[];
  requiredSportIds?: number[];
}

export const SectionActionButton = ({
  label,
  onClick,
  requiredRoles = ["sport_manager"],
  requiredSportIds,
}: SectionActionButtonProps) => {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return null;
  }

  const userRole = session?.user?.role;
  if (!requiredRoles.includes(userRole)) {
    return null;
  }

  if (requiredSportIds && requiredSportIds.length > 0) {
    const hasAccess = requiredSportIds.some((sportId) =>
      session?.user?.managedSportIds?.includes(sportId)
    );
    if (!hasAccess) {
      return null;
    }
  }

  return (
    <AppButton
      type="button"
      variant="secondary"
      isUppercase
      onClick={onClick}
      className="py-2 px-5"
    >
      {label}
    </AppButton>
  );
};

export default SectionActionButton;