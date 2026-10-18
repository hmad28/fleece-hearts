import type { Services } from "./contracts";
import { createMockServices } from "./mock";

export type { Services } from "./contracts";

const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

function createServices(): Services {
  switch (source) {
    case "mock":
      return createMockServices();
    case "api":
      // Tahap 4: implementasi ./api yang memanggil backend Fastify di VPS.
      throw new Error("API adapter belum dibuat (Tahap 4). Pakai NEXT_PUBLIC_DATA_SOURCE=mock.");
    default:
      throw new Error(`NEXT_PUBLIC_DATA_SOURCE tidak dikenal: ${source}`);
  }
}

export const services: Services = createServices();
