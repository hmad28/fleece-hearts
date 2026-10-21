import type {
  CreateShipmentInput,
  Shipment,
  ShipmentTracking,
  ShippingProvider,
  ShippingRate,
  ShippingRateInput,
} from "@fh/types";
import { STORE_LOCATION } from "@/config/store-location";
import { haversineKm } from "@/lib/geo/route";
import { mockCourierServices } from "@/mocks/data/commerce";
import { delay, mockId } from "./delay";

const round500 = (n: number) => Math.round(n / 500) * 500;

function regularEta(km: number): { label: string; min: number; max: number } {
  if (km <= 60) return { label: "1–2 hari", min: 1, max: 2 };
  if (km <= 300) return { label: "2–3 hari", min: 2, max: 3 };
  if (km <= 1000) return { label: "3–5 hari", min: 3, max: 5 };
  return { label: "4–7 hari", min: 4, max: 7 };
}

/**
 * Tarif DUMMY berdasarkan jarak jalan dari toko (Cileungsi) + berat.
 * Bukan tarif ekspedisi asli. Nanti diganti Biteship / RajaOngkir DI BACKEND.
 */
export function quoteByDistance(distanceKm: number, weightGram: number): ShippingRate[] {
  const kg = Math.max(1, Math.ceil(weightGram / 1000));
  const base = Math.max(10000, round500(8000 + distanceKm * 14)) * kg;
  const eta = regularEta(distanceKm);
  const reg = (courierCode: string, courierName: string, service: string, factor: number): ShippingRate => ({
    courierCode, courierName, service, serviceName: "Reguler", group: "REGULER",
    price: round500(base * factor), etdDays: { min: eta.min, max: eta.max }, etaLabel: eta.label, available: true,
  });
  return [
    reg("jne", "JNE", "REG", 1),
    reg("jnt", "J&T Express", "EZ", 0.95),
    reg("sicepat", "SiCepat", "REG", 0.97),
    reg("anteraja", "AnterAja", "REG", 0.93),
    {
      courierCode: "jne", courierName: "JNE", service: "YES", serviceName: "Yakin Esok Sampai", group: "EXPRESS",
      price: round500(base * 1.7), etdDays: { min: 1, max: distanceKm <= 1000 ? 1 : 2 },
      etaLabel: distanceKm <= 1000 ? "Besok sampai" : "1–2 hari", available: true,
    },
    {
      courierCode: "anteraja", courierName: "AnterAja", service: "SAMEDAY", serviceName: "Same Day", group: "SAME_DAY",
      price: round500(15000 + distanceKm * 500), etdDays: { min: 0, max: 0 }, etaLabel: "Hari ini, maks. 21.00",
      available: distanceKm <= 60, reason: "Hanya untuk jarak ≤ 60 km dari toko",
    },
    {
      courierCode: "instant", courierName: "Instant Courier", service: "MOTOR", serviceName: "Motor", group: "INSTANT",
      price: round500(9000 + distanceKm * 2400), etdDays: { min: 0, max: 0 }, etaLabel: "1–3 jam",
      available: distanceKm <= 30, reason: "Hanya untuk jarak ≤ 30 km dari toko",
    },
  ];
}

export class MockShippingProvider implements ShippingProvider {
  private readonly shipments = new Map<string, Shipment>();

  async getRates(input: ShippingRateInput): Promise<ShippingRate[]> {
    await delay(250);
    const { latitude, longitude } = input.destination;
    const km = input.distanceKm
      ?? (latitude != null && longitude != null ? haversineKm(STORE_LOCATION, { lat: latitude, lng: longitude }) * 1.3 : undefined);
    if (km != null) return quoteByDistance(km, input.weightGram);
    // Tanpa koordinat: tarif per kg sederhana.
    const kg = Math.max(1, Math.ceil(input.weightGram / 1000));
    return mockCourierServices.map((s) => ({
      courierCode: s.courierCode,
      courierName: s.courierName,
      service: s.service,
      serviceName: s.serviceName,
      price: s.perKg * kg,
      etdDays: { ...s.etd },
      etaLabel: `${s.etd.min}–${s.etd.max} hari`,
      available: true,
    }));
  }

  async createShipment(input: CreateShipmentInput): Promise<Shipment> {
    await delay(300);
    const shipment: Shipment = {
      id: mockId("shp"),
      orderId: input.orderId,
      courierCode: input.courierCode,
      service: input.service,
      trackingNumber: `MOCK${Date.now().toString().slice(-9)}`,
      status: "READY",
    };
    this.shipments.set(shipment.trackingNumber, shipment);
    return shipment;
  }

  async trackShipment(trackingNumber: string): Promise<ShipmentTracking> {
    await delay(300);
    const shipment = this.shipments.get(trackingNumber);
    const courierCode = shipment?.courierCode ?? "jne";
    const t = Date.now();
    const at = (hoursAgo: number) => new Date(t - hoursAgo * 3_600_000).toISOString();
    return {
      trackingNumber,
      courierCode,
      status: "IN_TRANSIT",
      events: [
        { at: at(2), status: "IN_TRANSIT", description: "Paket dalam perjalanan ke kota tujuan", location: "Hub transit (simulasi)" },
        { at: at(20), status: "PICKED_UP", description: "Paket diambil kurir", location: STORE_LOCATION.short },
        { at: at(26), status: "READY", description: "Paket siap dikirim" },
      ],
    };
  }
}
