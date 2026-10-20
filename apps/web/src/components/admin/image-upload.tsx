"use client";

import { generateUploadButton } from "@uploadthing/react";
import type { AppFileRouter } from "@/app/api/uploadthing/core";

const UploadButton = generateUploadButton<AppFileRouter>();

export function ImageUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  return <div className="space-y-2 text-sm">
    <p>{label}</p>
    {value && <a href={value} target="_blank" rel="noreferrer" className="block break-all text-xs underline">Lihat gambar saat ini</a>}
    <UploadButton endpoint="adminImage" onClientUploadComplete={(files) => { const url = files[0]?.ufsUrl; if (url) onChange(url); }} onUploadError={(error) => window.alert(error.message)} />
    <p className="text-xs text-stone">JPG, PNG, WebP, atau gambar lain hingga 8 MB. Setelah upload, simpan formulir.</p>
  </div>;
}
