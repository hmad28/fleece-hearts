"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import type { Region } from "@/lib/geo/wilayah";
import { cn } from "@/lib/utils";

interface RegionSelectProps {
  id: string;
  label: string;
  placeholder: string;
  /** null = belum bisa dipilih (induk belum dipilih). */
  queryKey: string[] | null;
  load: () => Promise<Region[]>;
  value: Region | null;
  onChange: (r: Region | null) => void;
  error?: string;
}

export function RegionSelect({ id, label, placeholder, queryKey, load, value, onChange, error }: RegionSelectProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKey ?? ["wilayah", "disabled", id],
    queryFn: load,
    enabled: Boolean(queryKey),
    staleTime: Infinity,
  });
  const disabled = !queryKey || isLoading || isError;

  return (
    <div>
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <div className="relative mt-1.5">
      <select
        id={id}
        value={value?.id ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(data?.find((r) => r.id === e.target.value) ?? null)}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-12 w-full appearance-none rounded-xl border bg-paper px-4 pr-10 text-base disabled:bg-mist disabled:text-stone",
          error ? "border-danger" : "border-line focus:border-ink",
        )}
      >
        <option value="">{isLoading ? "Memuat…" : !queryKey ? "Pilih wilayah di atasnya dulu" : `Pilih ${placeholder}`}</option>
        {data?.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" aria-hidden />
      </div>
      {isError && (
        <p className="mt-1.5 text-sm text-danger">
          Gagal memuat data wilayah.{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            Coba lagi
          </button>
        </p>
      )}
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
