"use client";

import React from "react";
import Link from "next/link";

interface AppButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isLoading?: boolean;
  isUppercase?: boolean;
}

export const AppButton = ({
  children,
  onClick,
  href,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  isLoading = false,
  isUppercase = false,
}: AppButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center font-display font-bold transition-all duration-300 rounded-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary text-on-primary py-3 px-8 hover:scale-[1.02] active:scale-[0.98] shadow-ambient/5",
    secondary:
      "bg-surface-container-highest text-primary py-3 px-8 hover:bg-surface-bright hover:scale-[1.01] active:scale-[0.99]",
    tertiary:
      "text-on-surface py-2 px-4 hover:bg-primary/10 active:bg-primary/20",
    danger:
      "bg-red-500/10 text-red-500 py-3 px-8 hover:bg-red-500 hover:text-white active:scale-[0.98]",
  };

  const combinedClassName = `
    ${baseStyles} 
    ${variants[variant]} 
    ${isUppercase ? "uppercase tracking-widest text-[11px]" : ""} 
    ${isLoading ? "relative !text-transparent" : ""}
    ${className}
  `.trim();

  const content = (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClassName}
      disabled={disabled || isLoading}
    >
      {content}
    </button>
  );
};

export default AppButton;

