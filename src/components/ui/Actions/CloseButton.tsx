"use client";

import { IoClose } from "react-icons/io5";

interface CloseButtonProps {
  onClick: () => void;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

export const CloseButton = ({
  onClick,
  size = 20,
  className = "absolute right-4 top-4 z-20 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50",
  ariaLabel = "Zavřít"
}: CloseButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
    >
      <IoClose size={size} />
    </button>
  );
};

export default CloseButton;
