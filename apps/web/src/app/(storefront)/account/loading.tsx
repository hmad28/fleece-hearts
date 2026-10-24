import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return <div aria-busy="true" aria-label="Memuat halaman akun" className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 2 }, (_, index) => <div key={index} className="space-y-7 rounded-[24px] border border-[#e8e0d8] bg-white p-6"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-32" /></div>)}
    </div>
    <div className="space-y-5 rounded-[24px] border border-[#e8e0d8] bg-white p-6 sm:p-8">
      <Skeleton className="h-5 w-44" />
      {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-12 w-full" />)}
    </div>
  </div>;
}
