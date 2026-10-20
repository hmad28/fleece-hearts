import { ContentEditor } from "@/components/admin/content-editor";
import { getSiteContent } from "@/lib/site-content";
import { requireAdmin } from "@/lib/auth/admin";

export default async function ContentPage() {
  await requireAdmin();
  return <><h1 className="font-display text-5xl">Konten beranda</h1><p className="my-5 text-stone">Atur pengumuman, teks hero, dan bagian yang tampil di homepage.</p><ContentEditor initial={await getSiteContent()} /></>;
}
