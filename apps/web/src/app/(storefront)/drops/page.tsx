import type { Metadata } from "next";
import Link from "next/link";
import { DropStatusLabel } from "@/components/drop/drop-status-label";
import { Media } from "@/components/ui/media";
import { formatReleaseWIB } from "@/lib/datetime";
import { getDropContext } from "@/lib/drop-context";

export const metadata: Metadata = { title: "Drops" };

export default async function DropsPage() {
  const { drops } = await getDropContext();
  const sorted = [...drops].sort((a, b) => b.releaseAt.localeCompare(a.releaseAt));

  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-10 md:px-8 md:pt-16">
      <h1 className="font-display text-[clamp(3rem,10vw,7rem)]">Drops</h1>
      <p className="mt-4 max-w-xl text-lg">Setiap koleksi dirilis di jam tertentu. Stoknya terbatas.</p>

      {sorted.length === 0 ? (
        <p className="py-24 text-lg">Belum ada drop yang dijadwalkan.</p>
      ) : (
        <ul className="mt-12 grid gap-10 md:grid-cols-2">
          {sorted.map((d) => (
            <li key={d.id}>
              <Link href={`/drops/${d.slug}`} className="group block">
                <Media asset={d.banner} tone="ink" placeholderLabel="Banner drop menyusul" className="aspect-[16/10] w-full" />
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] group-hover:underline group-hover:underline-offset-8">
                      {d.code}
                    </h2>
                    <p className="mt-1">{d.name}</p>
                    <p className="mt-1 text-sm text-stone">{formatReleaseWIB(d.releaseAt)}</p>
                  </div>
                  <DropStatusLabel status={d.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
