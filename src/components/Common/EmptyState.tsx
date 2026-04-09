import React from "react";

interface EmptyStateProps {
  message: string;
  className?: string;
}

export const EmptyState = ({ message, className = "" }: EmptyStateProps) => {
  return (
    <div className={`bg-surface-container-low p-6 sm:p-10 md:p-12 rounded-md text-center ${className}`}>
      <p className="text-on-surface/40 font-sans italic">{message}</p>
    </div>
  );
};

export default EmptyState;
