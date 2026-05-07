import { ReactNode } from "react";
import SectionHeader from "@/components/Common/SectionHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({children}: { children: ReactNode; }) {
    return (
        <div className="stack-page">
            <SectionHeader title="Admin Panel" as="h1" className="mb-6"/>

            <div className="flex flex-col lg:flex-row">
                <aside className="w-full lg:w-64 bg-surface-container-low p-4 rounded-md shadow-ambient mr-5">
                    <AdminSidebar />
                </aside>

                <main className="flex-1 p-6 bg-surface-container rounded-md shadow-ambient">
                    {children}
                </main>
            </div>
        </div>
    );
}

