import React from "react";
import Link from "next/link";
import { sportIcons } from "@/components/features/sports/sportIcons";
import { Circle } from "lucide-react";

export interface SportTileProps {
  name: string;
  href?: string;
}

export const SportTile = ({ name, href }: SportTileProps) => {
  const icon = sportIcons[name] || <Circle size={14} />;

  const content = (
    <div className="flex items-center gap-4">
      <div className="text-primary/60 group-hover:text-primary transition-colors shrink-0">
        {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 20 })}
      </div>
      <span className="font-display font-bold uppercase tracking-widest text-[11px] leading-none">
        {name}
      </span>
    </div>
  );

  const className =
    "tile-surface group text-on-surface/70 hover:text-on-surface transition-all active:scale-[0.98] flex items-center p-6";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={`${className} cursor-default`}>{content}</div>;
};

export default SportTile;

