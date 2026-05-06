"use client";

import { useSession } from "next-auth/react";

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
    <button
      type="button"
      onClick={onClick}
      className="text-on-surface/60 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-lowest"
    >
      {label}
    </button>
  );
};

export default SectionActionButton;