import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = { title: "Kontak | Fleece Hearts" };
export const dynamic = "force-dynamic";

function handleFromUrl(value: string) {
  try {
    const url = new URL(value);
    const handle = url.pathname.split("/").filter(Boolean)[0];
    return handle ? (handle.startsWith("@") ? handle : `@${handle}`) : url.hostname;
  } catch { return value; }
}

export default async function ContactPage() {
  const content = await getSiteContent();
  const links = [
    content.whatsappNumber && { label: "WhatsApp", value: content.whatsappNumber, href: `https://wa.me/${content.whatsappNumber.replace(/\D/g, "")}` },
    content.instagramUrl && { label: "Instagram", value: handleFromUrl(content.instagramUrl), href: content.instagramUrl },
    content.tiktokUrl && { label: "TikTok", value: handleFromUrl(content.tiktokUrl), href: content.tiktokUrl },
    content.contactEmail && { label: "Email", value: content.contactEmail, href: `mailto:${content.contactEmail}` },
  ].filter((item): item is { label: string; value: string; href: string } => Boolean(item));

  return <div className="mx-auto min-h-[60dvh] max-w-5xl px-5 pb-24 pt-16 sm:px-10"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Fleece Hearts</p><h1 className="font-display mt-5 text-5xl sm:text-7xl">Kontak.</h1><div className="mt-14 border-t border-ink">{links.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 border-b border-line py-6 transition-colors hover:text-brand"><span className="w-28 shrink-0 text-sm font-semibold">{item.label}</span><span className="min-w-0 flex-1 truncate text-sm text-stone sm:text-base">{item.value}</span><ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></a>)}{content.location && <p className="border-b border-line py-6 text-sm text-stone"><strong className="mr-6 text-ink">Lokasi</strong>{content.location}</p>}{links.length === 0 && !content.location && <p className="py-6 text-sm text-stone">Kontak belum tersedia.</p>}</div></div>;
}
