const TZ = "Asia/Jakarta";

/** "Rabu, 21 Oktober · 19.00 WIB" */
export function formatReleaseWIB(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(d);
  const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(d);
  return `${date}, ${time} WIB`;
}
