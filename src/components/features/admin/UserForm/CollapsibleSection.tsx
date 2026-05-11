import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CollapsibleSectionProps = {
    title: string;
    icon: any;
    children: React.ReactNode;
    defaultOpen?: boolean;
};

export const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }: CollapsibleSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-outline-variant/10 rounded-xl overflow-hidden bg-surface-container-low/50">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-surface-container/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon size={18} className="text-primary" />
                    <span className="font-display font-bold uppercase tracking-widest text-[11px] text-on-surface">
                        {title}
                    </span>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-on-surface/40" /> : <ChevronDown size={16} className="text-on-surface/40" />}
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                        <div className="p-6 pt-2 space-y-6 border-t border-outline-variant/5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

