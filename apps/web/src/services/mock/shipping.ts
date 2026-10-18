import type {
  CreateShipmentInput,
  Shipment,
  ShipmentTracking,
  ShippingProvider,
  ShippingRate,
  ShippingRateInput,
} from "@fh/types";
import { mockCourierServices } from "@/mocks/data/commerce";
import { delay, mockId } from "./delay";

/**
 * Simulasi aggregator ongkir. Tarif = perKg × berat (dibulatkan ke atas per kg).
 * Nanti diganti provider asli (Biteship / RajaOngkir) DI BACKEND.
 */
export class MockShippingProvider implements ShippingProvider {
  private readonly shipments = new Map<string, Shipment>();

  async getRates(input: ShippingRateInput): Promise<ShippingRate[]> {
    await delay(350);
    const kg = Math.max(1, Math.ceil(input.weightGram / 1000));
    return mockCourierServices.map((s) => ({
      courierCode: s.courierCode,
      courierName: s.courierName,
      service: s.service,
      serviceName: s.serviceName,
      price: s.perKg * kg,
      etdDays: { ...s.etd },
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
        { at: at(20), status: "PICKED_UP", description: "Paket diambil kurir", location: "Gudang (simulasi)" },
        { at: at(26), status: "READY", description: "Paket siap dikirim" },
      ],
    };
  }
}
