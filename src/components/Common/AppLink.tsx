"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface LinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    showUnderline?: boolean;
}

export const AppLink = ({ href, children, className, showUnderline = false }: LinkProps) => {
    const pathname = usePathname();

    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

    return (
        <Link 
            href={href} 
            className={`group relative block transition-colors hover:text-primary ${
                isActive ? 'text-primary' : 'text-on-surface/70'
            } ${className || ''}`}
        >
            {children}
            
            {showUnderline && (
                <span
                    className={`absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-primary transition-all duration-300
                        ${isActive
                            ? 'opacity-100 scale-x-100'
                            : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-110'
                        }`}
                />
            )}
        </Link>
    );
};

export default AppLink;
