import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  rightContent?: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

export const SectionHeader = ({ 
  title, 
  description,
  rightContent, 
  as: Tag = "h2", 
  className = "" 
}: SectionHeaderProps) => {
  return (
    <div className={`flex flex-row items-center justify-between gap-4 ${className}`}>
      <div className="border-l-4 border-primary pl-6 space-y-2">
        <Tag className="text-4xl font-display font-bold uppercase tracking-display text-on-surface leading-tight">
          {title}
        </Tag>
        {description && (
          <p className="text-sm font-sans text-on-surface/40 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {rightContent && (
        <div className="flex items-center shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;

