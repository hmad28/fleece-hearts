import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return <div aria-busy="true" aria-label="Memuat Fleece Hearts" className="min-h-dvh bg-paper">
    <div className="flex h-16 items-center justify-between border-b border-line px-4 md:px-10"><Skeleton className="h-6 w-36" /><Skeleton className="h-9 w-20 rounded-full" /></div>
    <div className="mx-auto max-w-[90rem] space-y-8 px-4 py-10 md:px-8 md:py-16"><Skeleton className="h-5 w-28" /><Skeleton className="h-12 w-64 max-w-full" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="aspect-[4/5] w-full rounded-2xl" />)}</div></div>
  </div>;
}
