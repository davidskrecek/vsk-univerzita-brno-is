"use client"

import React from 'react';
import Link from 'next/link';

interface AppButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary' | 'tertiary';
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export const AppButton = ({
    children,
    onClick,
    href,
    variant = 'primary',
    className = '',
    type = 'button',
    disabled = false,
}: AppButtonProps) => {
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 rounded-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-primary text-on-primary py-3 px-8 hover:scale-[1.02] active:scale-[0.98] shadow-ambient/5",
        secondary: "bg-surface-container-highest text-primary py-3 px-8 hover:bg-surface-bright hover:scale-[1.01] active:scale-[0.99]",
        tertiary: "text-on-surface py-2 px-4 hover:bg-primary/10 active:bg-primary/20",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

    if (href) {
        return (
            <Link href={href} className={combinedClassName}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={combinedClassName}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default AppButton;
