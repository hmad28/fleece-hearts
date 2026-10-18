import type { Rupiah } from "@fh/types";

const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 349000 → "Rp 349.000" */
export function formatRupiah(amount: Rupiah): string {
  // Intl id-ID memakai non-breaking space setelah "Rp"; samakan jadi spasi biasa.
  return formatter.format(amount).replace(/ /g, " ");
}

export function assertRupiah(amount: number): asserts amount is Rupiah {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`Nominal rupiah harus integer >= 0, dapat: ${amount}`);
  }
}
