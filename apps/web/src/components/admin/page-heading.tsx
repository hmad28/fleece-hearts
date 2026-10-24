import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
    <div><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-brand">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-stone">{description}</p></div>
    {action}
  </div>;
}
