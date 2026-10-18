import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Tombol berbentuk pill — lembut seperti fleece, senada dengan bentuk huruf Coolvetica.
 * `brand` (kuning) hanya untuk SATU aksi utama per layar.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        brand: "bg-brand text-ink hover:bg-brand-press",
        ink: "bg-ink text-paper hover:bg-ink/85",
        outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
        ghost: "text-ink hover:bg-mist",
        onBrand: "bg-ink text-brand hover:bg-ink/85",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        icon: "size-11",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "ink", size: "md", block: false },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, block, ...props }: ComponentProps<"button"> & ButtonVariants) {
  return <button className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}

export function ButtonLink({ className, variant, size, block, ...props }: ComponentProps<typeof Link> & ButtonVariants) {
  return <Link className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}
