import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  rightContent?: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

export const SectionHeader = ({ 
  title, 
  rightContent, 
  as: Tag = "h2", 
  className = "" 
}: SectionHeaderProps) => {
  return (
    <div className={`flex items-end justify-between ${className}`}>
      <div className="border-l-4 border-primary pl-6">
        <Tag className="text-4xl font-display font-bold uppercase tracking-display text-on-surface leading-none">
          {title}
        </Tag>
      </div>
      {rightContent && <div className="flex items-center">{rightContent}</div>}
    </div>
  );
};

export default SectionHeader;
