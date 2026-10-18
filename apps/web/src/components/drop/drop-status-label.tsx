import type { DropStatus } from "@fh/types";
import { Badge } from "@/components/ui/badge";

const LABEL: Record<DropStatus, { text: string; tone: "brand" | "ink" | "muted" | "outline" }> = {
  UPCOMING: { text: "Segera rilis", tone: "brand" },
  LIVE: { text: "Sudah rilis", tone: "ink" },
  SOLD_OUT: { text: "Habis terjual", tone: "muted" },
  ENDED: { text: "Selesai", tone: "outline" },
};

export function DropStatusLabel({ status }: { status: DropStatus }) {
  const l = LABEL[status];
  return <Badge tone={l.tone}>{l.text}</Badge>;
}
