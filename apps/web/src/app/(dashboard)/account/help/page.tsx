import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, PackageSearch, RotateCcw } from "lucide-react";
import { getSiteContent } from "@/lib/site-content";

const topics = [
  { title: "Di mana paket saya?", body: "Buka Pesanan saya, pilih order, lalu lihat status dan nomor resi pada bagian pelacakan." },
  { title: "Bagaimana mengajukan retur?", body: "Hubungi admin lewat chat dengan nomor order, produk, dan alasan retur. Tim toko akan membantu langkah berikutnya." },
  { title: "Bagaimana mengubah alamat?", body: "Alamat tersimpan bisa diubah di panel akun. Untuk pesanan yang sudah dibuat, hubungi admin secepatnya lewat chat." },
];

export default async function HelpPage() {
  const content = await getSiteContent();
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.7fr)]"><div className="space-y-5"><section className="rounded-[24px] border border-[#e9e2dc] bg-white p-5 sm:p-7"><h2 className="text-[1.1rem] font-semibold">Pertanyaan umum</h2><div className="mt-4 divide-y divide-[#eee8e2]">{topics.map((topic) => <details key={topic.title} className="group py-4"><summary className="cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">{topic.title}<span className="float-right text-brand group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-6 text-stone">{topic.body}</p></details>)}</div></section><div className="grid gap-3 sm:grid-cols-2"><Link href="/account/orders" className="flex items-center gap-3 rounded-[20px] border border-[#e9e2dc] bg-white p-5 hover:border-brand/40"><PackageSearch className="size-5 text-brand" /><span className="flex-1 text-sm font-semibold">Lacak pesanan</span><ArrowRight className="size-4 text-brand" /></Link><Link href="/account/chat?topik=retur" className="flex items-center gap-3 rounded-[20px] border border-[#e9e2dc] bg-white p-5 hover:border-brand/40"><RotateCcw className="size-5 text-brand" /><span className="flex-1 text-sm font-semibold">Ajukan retur / refund</span><ArrowRight className="size-4 text-brand" /></Link></div></div><aside className="h-fit space-y-4 rounded-[24px] bg-brand p-6 text-white sm:p-7"><MessageCircle className="size-7" /><h2 className="text-[1.2rem] font-semibold">Kami siap membantu</h2><p className="text-sm leading-6 text-white/80">Tanyakan produk, pesanan, atau pengiriman langsung ke admin.</p><Link href="/account/chat" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand">Buka chat <ArrowRight className="size-4" /></Link>{content.contactEmail && <a href={`mailto:${content.contactEmail}`} className="flex items-center gap-2 pt-2 text-sm text-white/80 hover:text-white"><Mail className="size-4" /> {content.contactEmail}</a>}</aside></div>;
}
