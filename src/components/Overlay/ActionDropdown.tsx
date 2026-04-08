"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export interface ActionDropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  onSelect?: () => void;
}

interface ActionDropdownProps {
  trigger: React.ReactNode;
  items: ActionDropdownItem[];
  align?: "start" | "center" | "end";
  sideOffset?: number;
  contentClassName?: string;
  itemClassName?: string;
}

export const ActionDropdown = ({
  trigger,
  items,
  align = "center",
  sideOffset = 8,
  contentClassName = "",
  itemClassName = "",
}: ActionDropdownProps) => {
  const baseItemClassName =
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-on-surface/80 outline-none transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer";

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={`glass-overlay z-[2100] min-w-[10rem] rounded-md p-1 shadow-ambient border border-outline-variant/10 animate-in fade-in zoom-in-95 duration-200 ${contentClassName}`}
          sideOffset={sideOffset}
          align={align}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.key}
              asChild
              className={`${baseItemClassName} ${itemClassName}`}
              onSelect={(e) => {
                e.stopPropagation();
                item.onSelect?.();
              }}
            >
              {item.href ? (
                <a
                  href={item.href}
                  target={item.target}
                  rel={item.rel}
                >
                  {item.icon}
                  {item.label}
                </a>
              ) : (
                <button type="button">
                  {item.icon}
                  {item.label}
                </button>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ActionDropdown;

