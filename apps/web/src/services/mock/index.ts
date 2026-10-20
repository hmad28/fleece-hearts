import type { Services } from "../contracts";
import { MockCatalogService } from "./catalog";
import { MockDropService } from "./drops";
import { MockOrderService } from "./orders";
import { MockPaymentProvider } from "./payment";
import { MockShippingProvider } from "./shipping";

export function createMockServices(): Services {
  const catalog = new MockCatalogService();
  const payment = new MockPaymentProvider();
  const shipping = new MockShippingProvider();
  return {
    catalog,
    drops: new MockDropService(catalog),
    orders: new MockOrderService(catalog, payment, shipping, new MockDropService(catalog)),
    payment,
    shipping,
  };
}
