"use client";

import { motion } from "framer-motion";

export const MiniSpinner = () => {
  return (
    <div className="h-10 w-10 flex items-center justify-center">
      <motion.div
        className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default MiniSpinner;

