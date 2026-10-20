#!/usr/bin/env node
/**
 * Generator ilustrasi produk & campaign DUMMY (SVG) untuk mode demo.
 * Output: public/mock/products/<slug>-<n>.svg dan public/mock/campaign/*.svg
 *
 * ⚠️ Ini BUKAN foto produk asli. Ganti dengan foto Fleece Hearts saat sudah ada
 * (cukup ubah `url` di src/mocks/data/catalog.ts, lalu hapus folder public/mock).
 *
 * Jalankan: node scripts/generate-mock-art.mjs
 * Daftar SPECS harus sinkron dengan slug di src/mocks/data/catalog.ts.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "mock");

const C = {
  ink: "#000000",
  paper: "#F7F2EA",
  sand: "#E2D3BE",
  sandDeep: "#D3BFA3",
  mist: "#EFE6D8",
  brand: "#FFC200",
};

/** slug → jenis garmen, warna kain, warna detail (tali/print). */
export const SPECS = [
  { slug: "everyday-hoodie-black", garment: "hoodie", fill: "#1C1C1C", trim: C.paper },
  { slug: "everyday-hoodie-oat", garment: "hoodie", fill: "#E9DFCC", trim: C.ink },
  { slug: "heart-crewneck-forest", garment: "crewneck", fill: "#34493B", trim: C.paper },
  { slug: "monogram-tee-white", garment: "tee", fill: "#FBFAF6", trim: C.ink },
  { slug: "monogram-tee-black", garment: "tee", fill: "#181818", trim: C.paper },
  { slug: "polar-fleece-zip-butter", garment: "zip", fill: C.brand, trim: C.ink },
  { slug: "polar-fleece-zip-black", garment: "zip", fill: "#1C1C1C", trim: C.brand },
  { slug: "lounge-sweatpants-charcoal", garment: "pants", fill: "#3B3B3E", trim: C.paper },
  { slug: "lounge-sweatpants-oat", garment: "pants", fill: "#E9DFCC", trim: C.ink },
  { slug: "mark-cap-black", garment: "cap", fill: "#161616", trim: C.paper },
  { slug: "rib-beanie-butter", garment: "beanie", fill: C.brand, trim: C.ink },
  { slug: "canvas-tote-natural", garment: "tote", fill: "#EDE3D0", trim: C.ink },
];

const LOGO = ["M581 258 L564 1280", "M363 590 L1240 415", "M1018 668 L1035 1358", "M352 1102 L1276 898"];

/** Logo mark berpusat di (cx, cy) dengan tinggi `h` px. */
function mark(cx, cy, h, color, rotate = 0) {
  const s = h / 1206;
  return `<g transform="translate(${cx} ${cy}) rotate(${rotate}) scale(${s}) translate(-815 -808)" fill="none" stroke="${color}" stroke-width="96" stroke-linecap="round">${LOGO.map((d) => `<path d="${d}"/>`).join("")}</g>`;
}

const out = (w = 5) => `stroke="${C.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const OUT = out();
const shade = (a) => `fill="${C.ink}" fill-opacity="${a}"`;

function fleeceTexture(id) {
  return `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r="1.3" fill="#000" fill-opacity=".09"/><circle cx="7" cy="8" r="1.1" fill="#000" fill-opacity=".07"/></pattern>`;
}

const garments = {
  hoodie: {
    front: ({ fill, trim }) => `
      <path d="M146 140 C138 74 262 74 254 140 Z" fill="${fill}" ${OUT}/>
      <path d="M146 138 L104 154 Q74 168 66 214 L48 372 Q47 386 54 392 L86 395 Q93 392 93 384 L106 250 L108 420 Q108 428 116 428 L284 428 Q292 428 292 420 L294 250 L307 384 Q307 392 314 395 L346 392 Q353 386 352 372 L334 214 Q326 168 296 154 L254 138 Q200 160 146 138 Z" fill="${fill}" ${OUT}/>
      <path d="M160 136 C168 98 232 98 240 136 C222 152 178 152 160 136 Z" ${shade(0.4)}/>
      <path d="M146 140 C150 110 172 94 200 94 C228 94 250 110 254 140" fill="none" ${OUT}/>
      <path d="M140 330 L260 330 L278 398 L122 398 Z" ${shade(0.07)} ${out(4)}/>
      <path d="M108 404 L292 404 M50 368 L94 372 M306 372 L350 368" fill="none" ${out(4)}/>
      <path d="M182 148 L178 224 M218 148 L222 224" fill="none" stroke="${trim}" stroke-width="5" stroke-linecap="round"/>`,
    back: ({ fill, trim }) => `
      <path d="M146 138 L104 154 Q74 168 66 214 L48 372 Q47 386 54 392 L86 395 Q93 392 93 384 L106 250 L108 420 Q108 428 116 428 L284 428 Q292 428 292 420 L294 250 L307 384 Q307 392 314 395 L346 392 Q353 386 352 372 L334 214 Q326 168 296 154 L254 138 Q200 160 146 138 Z" fill="${fill}" ${OUT}/>
      <path d="M138 146 C128 62 272 62 262 146 C244 196 156 196 138 146 Z" fill="${fill}" ${OUT}/>
      <path d="M200 70 L200 188" fill="none" ${out(3)} stroke-opacity=".5"/>
      <path d="M108 404 L292 404 M50 368 L94 372 M306 372 L350 368" fill="none" ${out(4)}/>
      ${mark(200, 300, 120, trim, -3)}`,
    chest: [232, 198, 34],
    focus: [200, 200, 1.75],
  },
  crewneck: {
    front: ({ fill }) => `
      <path d="M150 134 L104 154 Q74 168 66 214 L48 372 Q47 386 54 392 L86 395 Q93 392 93 384 L106 250 L108 420 Q108 428 116 428 L284 428 Q292 428 292 420 L294 250 L307 384 Q307 392 314 395 L346 392 Q353 386 352 372 L334 214 Q326 168 296 154 L250 134 Q200 120 150 134 Z" fill="${fill}" ${OUT}/>
      <path d="M150 134 Q200 120 250 134 Q200 178 150 134 Z" ${shade(0.45)}/>
      <path d="M150 134 Q200 182 250 134 L242 131 Q200 164 158 131 Z" fill="${fill}" ${out(4)}/>
      <path d="M108 404 L292 404 M50 368 L94 372 M306 372 L350 368" fill="none" ${out(4)}/>`,
    back: ({ fill, trim }) => `
      <path d="M150 134 L104 154 Q74 168 66 214 L48 372 Q47 386 54 392 L86 395 Q93 392 93 384 L106 250 L108 420 Q108 428 116 428 L284 428 Q292 428 292 420 L294 250 L307 384 Q307 392 314 395 L346 392 Q353 386 352 372 L334 214 Q326 168 296 154 L250 134 Q200 124 150 134 Z" fill="${fill}" ${OUT}/>
      <path d="M150 134 Q200 124 250 134 L246 144 Q200 134 154 144 Z" ${shade(0.18)}/>
      <path d="M108 404 L292 404 M50 368 L94 372 M306 372 L350 368" fill="none" ${out(4)}/>
      ${mark(200, 270, 130, trim, -3)}`,
    chest: [200, 230, 64],
    focus: [200, 210, 1.7],
  },
  tee: {
    front: ({ fill }) => `
      <path d="M152 132 L96 150 L50 216 L92 246 L112 222 L112 422 Q112 428 118 428 L282 428 Q288 428 288 422 L288 222 L308 246 L350 216 L304 150 L248 132 Q200 120 152 132 Z" fill="${fill}" ${OUT}/>
      <path d="M152 132 Q200 120 248 132 Q200 170 152 132 Z" ${shade(0.45)}/>
      <path d="M152 132 Q200 174 248 132 L242 130 Q200 160 158 130 Z" fill="${fill}" ${out(4)}/>
      <path d="M58 206 L94 232 M342 206 L306 232" fill="none" ${out(4)}/>`,
    back: ({ fill, trim }) => `
      <path d="M152 132 L96 150 L50 216 L92 246 L112 222 L112 422 Q112 428 118 428 L282 428 Q288 428 288 422 L288 222 L308 246 L350 216 L304 150 L248 132 Q200 124 152 132 Z" fill="${fill}" ${OUT}/>
      <path d="M58 206 L94 232 M342 206 L306 232" fill="none" ${out(4)}/>
      ${mark(200, 236, 92, trim, -3)}`,
    chest: [236, 196, 34],
    focus: [200, 200, 1.7],
  },
  zip: {
    front: ({ fill, trim }) => `
      <path d="M150 128 L104 154 Q74 168 66 214 L48 372 Q47 386 54 392 L86 395 Q93 392 93 384 L106 250 L108 420 Q108 428 116 428 L284 428 Q292 428 292 420 L294 250 L307 384 Q307 392 314 395 L346 392 Q353 386 352 372 L334 214 Q326 168 296 154 L250 128 Z" fill="${fill}" ${OUT}/>
      <path d="M150 128 L104 154 Q74 168 66 214 L48 372 Q47 386 54 392 L86 395 Q93 392 93 384 L106 250 L108 420 Q108 428 116 428 L284 428 Q292 428 292 420 L294 250 L307 384 Q307 392 314 395 L346 392 Q353 386 352 372 L334 214 Q326 168 296 154 L250 128 Z" fill="url(#tex)"/>
      <path d="M150 132 L150 100 Q200 88 250 100 L250 132 Q200 146 150 132 Z" fill="${fill}" ${OUT}/>
      <path d="M200 98 L200 428" fill="none" ${out(4)}/>
      <rect x="194" y="116" width="12" height="26" rx="4" fill="${trim}" ${out(3)}/>
      <path d="M224 206 L268 206 L268 250 L224 250 Z" ${shade(0.08)} ${out(4)}/>
      <path d="M108 404 L292 404 M50 368 L94 372 M306 372 L350 368" fill="none" ${out(4)}/>`,
    back: ({ fill, trim }) => `
      <path d="M150 128 L104 154 Q74 168 66 214 L48 372 Q47 386 54 392 L86 395 Q93 392 93 384 L106 250 L108 420 Q108 428 116 428 L284 428 Q292 428 292 420 L294 250 L307 384 Q307 392 314 395 L346 392 Q353 386 352 372 L334 214 Q326 168 296 154 L250 128 Z" fill="${fill}" ${OUT}/>
      <path d="M150 128 L104 154 Q74 168 66 214 L48 372 Q47 386 54 392 L86 395 Q93 392 93 384 L106 250 L108 420 Q108 428 116 428 L284 428 Q292 428 292 420 L294 250 L307 384 Q307 392 314 395 L346 392 Q353 386 352 372 L334 214 Q326 168 296 154 L250 128 Z" fill="url(#tex)"/>
      <path d="M150 132 L150 100 Q200 88 250 100 L250 132 Q200 122 150 132 Z" fill="${fill}" ${OUT}/>
      <path d="M108 404 L292 404 M50 368 L94 372 M306 372 L350 368" fill="none" ${out(4)}/>
      ${mark(200, 280, 128, trim, -3)}`,
    chest: [160, 214, 34],
    focus: [190, 190, 1.75],
    textured: true,
  },
  pants: {
    front: ({ fill, trim }) => `
      <path d="M130 70 L270 70 L272 100 L290 420 L292 446 Q292 452 286 452 L214 454 Q208 454 208 448 L200 212 L192 448 Q192 454 186 454 L114 452 Q108 452 108 446 L110 420 L128 100 Z" fill="${fill}" ${OUT}/>
      <path d="M130 70 L270 70 L272 100 L128 100 Z" ${shade(0.12)} ${out(4)}/>
      <path d="M110 424 L190 426 M210 426 L290 424" fill="none" ${out(4)}/>
      <path d="M138 112 Q154 150 146 186 M262 112 Q246 150 254 186" fill="none" ${out(4)}/>
      <path d="M194 100 Q190 132 182 158 M206 100 Q210 132 218 158" fill="none" stroke="${trim}" stroke-width="5" stroke-linecap="round"/>`,
    back: ({ fill, trim }) => `
      <path d="M130 70 L270 70 L272 100 L290 420 L292 446 Q292 452 286 452 L214 454 Q208 454 208 448 L200 212 L192 448 Q192 454 186 454 L114 452 Q108 452 108 446 L110 420 L128 100 Z" fill="${fill}" ${OUT}/>
      <path d="M130 70 L270 70 L272 100 L128 100 Z" ${shade(0.12)} ${out(4)}/>
      <path d="M110 424 L190 426 M210 426 L290 424" fill="none" ${out(4)}/>
      <path d="M222 132 L262 132 L260 176 L224 176 Z" ${shade(0.08)} ${out(4)}/>
      ${mark(152, 396, 32, trim, -4)}`,
    chest: [250, 396, 30],
    focus: [200, 150, 1.7],
  },
  cap: {
    front: ({ fill, trim }) => `
      <path d="M104 300 C100 196 160 150 200 150 C240 150 300 196 296 300 Z" fill="${fill}" ${OUT}/>
      <path d="M200 152 L200 300 M150 172 Q138 232 146 300 M250 172 Q262 232 254 300" fill="none" ${out(3)} stroke-opacity=".6"/>
      <circle cx="200" cy="152" r="9" fill="${fill}" ${out(4)}/>
      <path d="M94 296 Q200 268 306 296 Q320 330 292 346 Q200 372 108 346 Q80 330 94 296 Z" fill="${fill}" ${OUT}/>
      <path d="M94 296 Q200 268 306 296 Q320 330 292 346 Q200 372 108 346 Q80 330 94 296 Z" ${shade(0.18)}/>
      ${mark(200, 244, 58, trim, -3)}`,
    back: ({ fill, trim }) => `
      <path d="M104 320 C100 216 160 170 200 170 C240 170 300 216 296 320 Z" fill="${fill}" ${OUT}/>
      <path d="M200 172 L200 270 M150 192 Q138 252 146 320 M250 192 Q262 252 254 320" fill="none" ${out(3)} stroke-opacity=".6"/>
      <circle cx="200" cy="172" r="9" fill="${fill}" ${out(4)}/>
      <path d="M160 320 Q160 286 200 286 Q240 286 240 320 Z" fill="${C.sand}" ${out(4)}/>
      <rect x="170" y="312" width="60" height="12" rx="3" fill="${trim}" ${out(3)}/>`,
    focus: [200, 255, 1.6],
  },
  beanie: {
    front: ({ fill, trim }) => `
      <path d="M112 300 C110 168 290 168 288 300 Z" fill="${fill}" ${OUT}/>
      <path d="M140 300 Q138 220 160 190 M170 300 Q170 210 182 178 M200 300 L200 172 M230 300 Q230 210 218 178 M260 300 Q262 220 240 190" fill="none" ${out(2.5)} stroke-opacity=".35"/>
      <path d="M100 290 L300 290 L302 372 Q200 386 98 372 Z" fill="${fill}" ${OUT}/>
      <path d="M100 290 L300 290 L302 372 Q200 386 98 372 Z" ${shade(0.1)}/>
      <path d="M125 294 L124 374 M150 294 L150 378 M175 294 L175 380 M200 294 L200 381 M225 294 L225 380 M250 294 L250 378 M275 294 L276 374" fill="none" ${out(2.5)} stroke-opacity=".35"/>
      <rect x="176" y="318" width="48" height="36" rx="3" fill="${C.paper}" ${out(3)}/>
      ${mark(200, 336, 26, trim, -3)}`,
    back: ({ fill }) => `
      <path d="M112 300 C110 168 290 168 288 300 Z" fill="${fill}" ${OUT}/>
      <path d="M140 300 Q138 220 160 190 M170 300 Q170 210 182 178 M200 300 L200 172 M230 300 Q230 210 218 178 M260 300 Q262 220 240 190" fill="none" ${out(2.5)} stroke-opacity=".35"/>
      <path d="M100 290 L300 290 L302 372 Q200 386 98 372 Z" fill="${fill}" ${OUT}/>
      <path d="M100 290 L300 290 L302 372 Q200 386 98 372 Z" ${shade(0.1)}/>`,
    focus: [200, 310, 1.7],
  },
  tote: {
    front: ({ fill, trim }) => `
      <path d="M148 206 C148 92 252 92 252 206" fill="none" stroke="${C.ink}" stroke-width="20" stroke-linecap="round"/>
      <path d="M148 206 C148 92 252 92 252 206" fill="none" stroke="${fill}" stroke-width="10" stroke-linecap="round"/>
      <path d="M106 196 L294 196 L304 446 L96 446 Z" fill="${fill}" ${OUT}/>
      <path d="M106 196 L294 196 L295 214 L105 214 Z" ${shade(0.08)}/>
      ${mark(200, 326, 120, trim, -3)}`,
    back: ({ fill }) => `
      <path d="M148 206 C148 92 252 92 252 206" fill="none" stroke="${C.ink}" stroke-width="20" stroke-linecap="round"/>
      <path d="M148 206 C148 92 252 92 252 206" fill="none" stroke="${fill}" stroke-width="10" stroke-linecap="round"/>
      <path d="M106 196 L294 196 L304 446 L96 446 Z" fill="${fill}" ${OUT}/>
      <path d="M106 196 L294 196 L295 214 L105 214 Z" ${shade(0.08)}/>
      <rect x="250" y="410" width="34" height="16" rx="2" fill="${C.ink}"/>`,
    focus: [200, 320, 1.5],
  },
};

function svg(w, h, body, defs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * 2}" height="${h * 2}"><defs>${fleeceTexture("tex")}${defs}</defs>${body}</svg>\n`;
}

function shadow(cx = 200, cy = 458, rx = 130) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="12" fill="#000" fill-opacity=".08"/>`;
}

function productViews(spec) {
  const g = garments[spec.garment];
  const front = g.front(spec);
  const chest = g.chest && !["cap", "beanie", "tote"].includes(spec.garment)
    ? mark(g.chest[0], g.chest[1], g.chest[2], spec.trim, -4)
    : "";
  const isDark = parseInt(spec.fill.slice(1, 3), 16) < 0x60;

  return [
    // 1. Depan, latar pasir
    svg(400, 500, `<rect width="400" height="500" fill="${C.sand}"/>${shadow()}${front}${chest}`),
    // 2. Belakang, latar mist
    svg(400, 500, `<rect width="400" height="500" fill="${C.mist}"/>${shadow()}${g.back(spec)}`),
    // 3. Detail (zoom dada / logo), latar kontras
    svg(
      400,
      500,
      `<rect width="400" height="500" fill="${isDark ? C.sandDeep : C.ink}"/><g transform="translate(200 250) scale(${g.focus[2]}) translate(${-g.focus[0]} ${-g.focus[1]})">${front}${chest}</g>`,
    ),
  ];
}

function campaign() {
  const butter = SPECS.find((s) => s.slug === "polar-fleece-zip-butter");
  const black = SPECS.find((s) => s.slug === "polar-fleece-zip-black");
  const cap = SPECS.find((s) => s.slug === "mark-cap-black");
  const g = garments;
  const wide = svg(
    1600,
    1000,
    `<rect width="1600" height="1000" fill="${C.brand}"/>
     ${mark(1180, 470, 900, "#000", -4).replace('stroke="#000"', 'stroke="#000" stroke-opacity=".08"')}
     <g transform="translate(560 120) rotate(-6) scale(1.65)">${g.zip.front(black)}${mark(160, 214, 34, black.trim, -4)}</g>
     <g transform="translate(860 150) rotate(5) scale(1.65)">${g.zip.front(butter)}${mark(160, 214, 34, butter.trim, -4)}</g>
     <g transform="translate(1190 560) rotate(-10) scale(0.95)">${g.cap.front(cap)}</g>`,
  );
  const tall = svg(
    800,
    1000,
    `<rect width="800" height="1000" fill="${C.brand}"/>
     ${mark(420, 500, 900, "#000", -4).replace('stroke="#000"', 'stroke="#000" stroke-opacity=".08"')}
     <g transform="translate(40 150) rotate(-6) scale(1.5)">${g.zip.front(black)}${mark(160, 214, 34, black.trim, -4)}</g>
     <g transform="translate(220 230) rotate(5) scale(1.5)">${g.zip.front(butter)}${mark(160, 214, 34, butter.trim, -4)}</g>`,
  );
  return { wide, tall };
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

for (const spec of SPECS) {
  productViews(spec).forEach((content, i) => write(join(root, "products", `${spec.slug}-${i + 1}.svg`), content));
}
const { wide, tall } = campaign();
write(join(root, "campaign", "ch01-wide.svg"), wide);
write(join(root, "campaign", "ch01-tall.svg"), tall);

console.log(`✓ ${SPECS.length * 3} ilustrasi produk + 2 campaign → public/mock`);
