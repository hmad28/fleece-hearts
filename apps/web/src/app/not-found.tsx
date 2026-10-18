import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70svh] max-w-[90rem] flex-col items-start justify-center px-4 md:px-8">
      <p className="font-display text-[clamp(5rem,20vw,14rem)]">404</p>
      <p className="mt-4 max-w-md text-lg">Halaman ini tidak ada atau sudah dipindah.</p>
      <ButtonLink href="/" className="mt-8">
        Kembali ke beranda
      </ButtonLink>
    </main>
  );
}
