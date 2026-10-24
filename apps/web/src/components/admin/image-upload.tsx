"use client";

import { generateUploadButton } from "@uploadthing/react";
import type { AppFileRouter } from "@/app/api/uploadthing/core";

const UploadButton = generateUploadButton<AppFileRouter>();

export function ImageUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  return <div className="space-y-2 text-sm">
    <p className="text-xs font-medium">{label}</p>
    {value && <a href={value} target="_blank" rel="noreferrer" className="block break-all text-xs text-brand underline">Lihat gambar</a>}
    <UploadButton endpoint="adminImage" onClientUploadComplete={(files) => { const url = files[0]?.ufsUrl; if (url) onChange(url); }} onUploadError={(error) => window.alert(error.message)} />
  </div>;
}
