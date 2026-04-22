"use client";

import SectionHeader from "@/components/Common/SectionHeader";
import OtherSection from "@/components/Other/OtherSection";

export default function OtherPage() {
    const sections = [
        {
            title: "Dokumenty",
            items: [
                { name: "Stanovy", href: "/docs/stanovy" },
                { name: "Výroční zprávy", href: "/docs/vyrocni-zpravy" },
                { name: "Zápisy", href: "/docs/zapisy" },
            ],
        },
        {
            title: "O klubu",
            items: [
                { name: "Historie", href: "/about/historie" },
                { name: "Partneři", href: "/about/partneri" },
            ],
        },
        {
            title: "Provoz",
            items: [
                { name: "Provozní řád", href: "/provoz/provozni-rad" },
            ],
        },
    ];

    return (
        <div className="stack-page">
            <SectionHeader title="Ostatní" as="h1" className="mb-4" />

            <div className="space-y-14">
                {sections.map((section) => (
                    <OtherSection
                        key={section.title}
                        title={section.title}
                        items={section.items}
                    />
                ))}
            </div>
        </div>
    );
}
