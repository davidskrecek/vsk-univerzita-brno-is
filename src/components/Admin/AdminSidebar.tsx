'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_MODULES = [
    {
        id: "users",
        name: "Správa uživatelů",
        href: "/admin/users",
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <nav>
            <ul className="space-y-2">
                {ADMIN_MODULES.map((module) => {
                    const isActive = pathname === module.href;

                    return (
                        <li key={module.id}>
                            <Link
                                href={module.href}
                                className={`block w-full text-left py-2 px-4 rounded-md transition-colors ${
                                    isActive
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "hover:bg-primary/10"
                                }`}
                            >
                                {module.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
