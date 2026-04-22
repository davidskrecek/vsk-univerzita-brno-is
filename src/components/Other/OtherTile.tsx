import Link from "next/link";

export interface OtherTileProps {
  name: string;
  href?: string;
}

export const OtherTile = ({ name, href }: OtherTileProps) => {
  const className =
    "tile-surface text-on-surface/70 hover:text-on-surface flex items-center justify-between group";

  if (href) {
    return (
      <Link href={href} className={className}>
        <span>{name}</span>
      </Link>
    );
  }

  return <div className={`${className} cursor-default`}>{name}</div>;
};

export default OtherTile;
