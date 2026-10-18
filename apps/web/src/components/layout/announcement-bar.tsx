import Link from "next/link";

/** Satu baris pengumuman (mis. jadwal drop). Nanti dikelola dari CMS. */
export function AnnouncementBar({ text, href }: { text: string; href?: string }) {
  const content = <span className="truncate">{text}</span>;
  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto flex h-9 max-w-[90rem] items-center justify-center px-4 text-xs md:text-sm">
        {href ? (
          <Link href={href} className="truncate underline-offset-4 hover:underline">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
