import { ContentEditor } from "@/components/admin/content-editor";
import { getSiteContent } from "@/lib/site-content";
import { requireAdmin } from "@/lib/auth/admin";
import { PageHeading } from "@/components/admin/page-heading";

export default async function ContentPage() {
  await requireAdmin();
  return <><PageHeading eyebrow="Konten / CMS" title="Tampilan toko" description="Atur gambar promosi, teks beranda, dan bagian yang terlihat oleh pengunjung." /><ContentEditor initial={await getSiteContent()} /></>;
}
