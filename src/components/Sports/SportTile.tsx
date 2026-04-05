import Link from "next/link";

export interface SportTileProps {
  name: string;
  href?: string;
}

export const SportTile = ({ name, href }: SportTileProps) => {
  const className =
    "tile-surface text-on-surface/70 hover:text-on-surface";

  if (href) {
    return (
      <Link href={href} className={className}>
        {name}
      </Link>
    );
  }

  return <div className={`${className} cursor-default`}>{name}</div>;
};

export default SportTile;
