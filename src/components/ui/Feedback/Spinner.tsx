"use client";

import { motion } from "framer-motion";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner = ({ size = "sm", className = "" }: SpinnerProps) => {
  const dimensions = {
    sm: { outer: "h-10 w-10", inner: "h-4 w-4" },
    md: { outer: "h-12 w-12", inner: "h-6 w-6" },
    lg: { outer: "h-16 w-16", inner: "h-8 w-8" }
  }[size];

  return (
    <div className={`${dimensions.outer} flex items-center justify-center ${className}`}>
      <motion.div
        className={`${dimensions.inner} border-2 border-primary/20 border-t-primary rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default Spinner;

