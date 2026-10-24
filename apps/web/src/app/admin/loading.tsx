import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return <div aria-busy="true" aria-label="Memuat halaman admin" className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => <div key={index} className="space-y-7 rounded-[24px] border border-[#e8e0d8] bg-white p-6"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-32" /></div>)}
    </div>
    <div className="space-y-5 rounded-[24px] border border-[#e8e0d8] bg-white p-6 sm:p-8">
      <Skeleton className="h-5 w-44" />
      {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-12 w-full" />)}
    </div>
  </div>;
}
