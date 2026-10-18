/**
 * Kontrak service frontend.
 * UI HANYA boleh bicara dengan interface ini — tidak boleh import mock data langsung.
 * Implementasi: ./mock (sekarang) → ./api (Tahap 4, panggil backend VPS).
 */
import type {
  Category,
  CreateOrderInput,
  DropWithStatus,
  ID,
  Order,
  OrderLookupInput,
  Paginated,
  PaymentProvider,
  Product,
  ProductListQuery,
  ShippingProvider,
  SizeGuide,
} from "@fh/types";

export interface CatalogService {
  listProducts(query?: ProductListQuery): Promise<Paginated<Product>>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductsByIds(ids: ID[]): Promise<Product[]>;
  listCategories(): Promise<Category[]>;
  getSizeGuide(id: ID): Promise<SizeGuide | null>;
}

export interface DropService {
  /** `serverNow` dikembalikan supaya countdown client bisa koreksi selisih jam. */
  listDrops(): Promise<{ drops: DropWithStatus[]; serverNow: string }>;
  getDropBySlug(slug: string): Promise<{ drop: DropWithStatus; serverNow: string } | null>;
}

export interface OrderService {
  createOrder(input: CreateOrderInput): Promise<Order>;
  getOrder(id: ID): Promise<Order | null>;
  /** Cek order tanpa login: nomor order + email/WA. */
  lookupOrder(input: OrderLookupInput): Promise<Order | null>;
}

export interface Services {
  catalog: CatalogService;
  drops: DropService;
  orders: OrderService;
  payment: PaymentProvider;
  shipping: ShippingProvider;
}
