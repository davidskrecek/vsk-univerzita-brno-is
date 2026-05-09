"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="w-full min-h-[40vh] flex items-center justify-center">
      <motion.div
        className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
