"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface PaginationProps {
  total: number;
  limit: number;
  currentPage: number;
}

export const Pagination = ({ total, limit, currentPage }: PaginationProps) => {
  const totalPages = Math.ceil(total / limit);
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const maxVisible = Math.min(5, totalPages);
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));

    if (start + maxVisible - 1 > totalPages) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    return Array.from({ length: maxVisible }, (_, i) => start + i);
  };

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {/* PREVIOUS */}
      <Link
        href={createPageUrl(Math.max(1, currentPage - 1))}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${currentPage === 1
          ? "text-on-surface/10 pointer-events-none"
          : "text-on-surface/40 hover:bg-primary/10 hover:text-primary hover:scale-110"
          }`}
      >
        <IoChevronBack size={18} />
      </Link>

      {/* PAGE NUMBERS */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((p) => (
          <Link
            key={p}
            href={createPageUrl(p)}
            className={`flex items-center justify-center min-w-[40px] h-10 px-2 rounded-full font-display font-bold text-[11px] transition-all duration-300 ${currentPage === p
              ? "bg-primary text-on-primary shadow-lg scale-105"
              : "text-on-surface/40 hover:bg-surface-container hover:text-on-surface hover:scale-105"
              }`}
          >
            {p}
          </Link>
        ))}
      </div>

      {/* NEXT */}
      <Link
        href={createPageUrl(Math.min(totalPages, currentPage + 1))}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${currentPage === totalPages
          ? "text-on-surface/10 pointer-events-none"
          : "text-on-surface/40 hover:bg-primary/10 hover:text-primary hover:scale-110"
          }`}
      >
        <IoChevronForward size={18} />
      </Link>
    </div>
  );
};

export default Pagination;

