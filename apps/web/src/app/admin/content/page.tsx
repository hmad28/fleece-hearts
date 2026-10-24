import { ContentEditor } from "@/components/admin/content-editor";
import { getSiteContent } from "@/lib/site-content";
import { requireAdmin } from "@/lib/auth/admin";

export default async function ContentPage() {
  await requireAdmin();
  return <ContentEditor initial={await getSiteContent()} />;
}
