import type { ID, ISODateString, Rupiah } from "./common";

export type ShipmentStatus =
  | "PENDING"
  | "READY"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED";

export interface ShippingRateInput {
  destination: { postalCode: string; city: string; district: string };
  weightGram: number;
  itemValue: Rupiah;
}

export interface ShippingRate {
  courierCode: string;
  courierName: string;
  service: string;
  serviceName: string;
  price: Rupiah;
  etdDays: { min: number; max: number };
}

export interface CreateShipmentInput {
  orderId: ID;
  courierCode: string;
  service: string;
}

export interface Shipment {
  id: ID;
  orderId: ID;
  courierCode: string;
  service: string;
  trackingNumber: string;
  status: ShipmentStatus;
}

export interface ShipmentTrackingEvent {
  at: ISODateString;
  status: ShipmentStatus;
  description: string;
  location?: string;
}

export interface ShipmentTracking {
  trackingNumber: string;
  courierCode: string;
  status: ShipmentStatus;
  events: ShipmentTrackingEvent[];
}

/**
 * Kontrak provider pengiriman (blueprint §27).
 * Sekarang: MockShippingProvider. Nanti: aggregator (Biteship / RajaOngkir) di BACKEND.
 */
export interface ShippingProvider {
  getRates(input: ShippingRateInput): Promise<ShippingRate[]>;
  createShipment(input: CreateShipmentInput): Promise<Shipment>;
  trackShipment(trackingNumber: string): Promise<ShipmentTracking>;
}
