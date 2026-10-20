/**
 * ⚠️ COPY DUMMY untuk demo — tagline, cerita brand, dan poin keunggulan BELUM dari klien.
 * Nanti dikelola dari CMS (blueprint §4). Ganti/konfirmasi ke klien sebelum go-live.
 */
export const homeCopy = {
  isDummy: true,
  hero: {
    title: "Fleece buat hari-hari biasa.",
    body: "Hoodie, crewneck, dan polar fleece dengan potongan boxy. Dirilis per chapter, stoknya terbatas.",
  },
  story: {
    title: "Dari satu goresan tangan.",
    body: "Logo kami digambar tangan, empat garis yang membentuk F dan H. Begitu juga cara kami bikin baju: sedikit model, dikerjakan pelan, dipakai lama.",
    points: [
      { title: "Fleece 300–330 gsm", body: "Tebal tapi tetap adem untuk cuaca tropis." },
      { title: "Potongan boxy", body: "Bahu turun, lengan sedikit panjang, rapi dipakai siapa saja." },
      { title: "Rilis per chapter", body: "Setiap drop punya jumlah terbatas dan tidak di-restock." },
    ],
  },
  newsletter: {
    title: "Kabari aku pas drop berikutnya.",
    body: "Satu email per rilis. Tanpa spam.",
  },
} as const;
