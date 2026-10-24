import { Skeleton } from "@/components/ui/skeleton";

export default function StorefrontLoading() {
  return <div aria-busy="true" aria-label="Memuat halaman" className="mx-auto max-w-[90rem] space-y-10 px-4 py-10 md:px-8 md:py-16">
    <div className="space-y-4"><Skeleton className="h-4 w-28" /><Skeleton className="h-12 w-64 max-w-full" /></div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => <div key={index} className="space-y-4"><Skeleton className="aspect-[4/5] w-full rounded-2xl" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>)}
    </div>
  </div>;
}
