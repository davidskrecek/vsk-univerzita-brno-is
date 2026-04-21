import Link from "next/link";
import Image from "next/image";

interface PostCardProps {
  category: string;
  title: string;
  description: string;
  href?: string;
  imageUrl?: string | null;
  postId?: string;
  isInline?: boolean;
}

export const PostCard = ({ 
  category, 
  title, 
  description, 
  href, 
  imageUrl, 
  postId,
  isInline = false 
}: PostCardProps) => {
  const finalHref = isInline ? `?postId=${postId}` : (href || '#');
  return (
    <Link
      href={finalHref}
      className="card-surface group flex flex-row items-center justify-between gap-4 sm:gap-8 no-underline"
    >
      {imageUrl ? (
        <div className="w-16 sm:w-20 aspect-square bg-surface-container-high rounded-md flex-shrink-0 relative overflow-hidden transition-colors group-hover:bg-surface-bright">
          {/* API image hookup prepared; hidden entirely when no image */}
          <Image src={imageUrl} alt={title} fill className="object-cover" sizes="5rem" />
        </div>
      ) : null}

      <div className="flex flex-col justify-center flex-grow min-w-0">
        <span className="meta-badge mb-2 w-fit">
          {category}
        </span>
        <h3 className="text-lg font-display font-bold text-on-surface group-hover:text-primary transition-colors leading-tight mb-1 line-clamp-2 sm:line-clamp-1">
          {title}
        </h3>
        <p className="text-xs text-on-surface/40 font-sans line-clamp-2 sm:line-clamp-1 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
};
