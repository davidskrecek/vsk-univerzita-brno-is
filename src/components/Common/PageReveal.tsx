"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const PageReveal = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: -20, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.99 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1], // Custom quintic easing for premium feel
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
