# FASHION E-COMMERCE & BUSINESS MANAGEMENT PLATFORM
## Master Project Blueprint for AI Developer

**Prepared for:** Hammad Studio  
**Project Type:** Fashion E-Commerce + Company Profile + Commerce Operations + Internal Business Management  
**Architecture:** Next.js Frontend on Vercel + Full Backend on VPS  
**Development Strategy:** Frontend-first with mock/simulated payment & shipping, then real backend integrations

---

# 1. PROJECT OVERVIEW

Project ini bukan sekadar website toko online biasa. Tujuan akhirnya adalah membangun **Fashion E-Commerce & Business Management Platform** yang menggabungkan:

- public-facing company profile,
- fashion storefront,
- e-commerce,
- customer dashboard,
- admin CMS,
- admin sales operations,
- inventory,
- finance,
- reporting,
- customer support,
- realtime chat,
- payment,
- shipping,
- dan internal business management.

Prinsip utama:

> **Build as a modular commerce platform, not as a collection of CRUD pages.**

---

# 2. PRODUCT POSITIONING

## Fashion E-Commerce & Business Management Platform

**Custom Storefront + Commerce Operations + Customer Portal + Internal Business Management**

Platform memiliki 3 sisi besar:

1. **Customer-facing Storefront**
2. **Customer Account Portal**
3. **Admin / Internal Business Platform**

---

# 3. MAIN MODULES

## 3.1 E-Commerce Storefront + Company Profile

Main pages:

- Homepage
- Shop
- Collections
- Categories
- Search
- Product Detail
- Wishlist
- Cart
- Checkout
- Payment
- Shipping
- Order Success
- Order Tracking
- About Brand
- Contact
- FAQ
- Shipping Policy
- Return / Refund Policy
- Privacy Policy
- Terms & Conditions
- Campaign / Drop Landing Page
- Lookbook
- Promo / Sale Page

### Homepage flow

1. Hero Campaign
2. Featured Collection
3. New Arrivals
4. Featured Products
5. Campaign Banner
6. Best Seller
7. Brand Story
8. Lookbook
9. Promo / CTA
10. Social / Instagram section
11. Newsletter
12. Footer

### Product Detail

Minimal:

- product name,
- price,
- discounted price if any,
- multiple images,
- product gallery,
- size,
- color,
- variant selector,
- stock status,
- size guide,
- material,
- description,
- care instruction,
- quantity,
- add to cart,
- add to wishlist,
- shipping info,
- return info,
- related products,
- recently viewed.

---

# 4. ADMIN CMS

CMS harus memungkinkan admin mengubah konten tanpa edit code.

Kelola:

- Hero
- Banner
- Campaign
- Collection
- New Arrivals
- Best Seller
- Lookbook
- Brand Story
- Static Pages
- FAQ
- Navigation
- Footer
- Promo
- SEO metadata
- OG image
- Homepage section ordering
- Enable/disable section
- Scheduled content

Recommended model:

```text
Page
└── Sections
    ├── Hero
    ├── Featured Collection
    ├── Promo Banner
    ├── New Arrivals
    ├── Best Seller
    ├── Lookbook
    ├── Brand Story
    ├── CTA
    └── Newsletter
```

Setiap section idealnya bisa:

- enable/disable,
- reorder,
- edit content,
- replace image,
- set CTA,
- schedule start/end,
- assign product/collection.

---

# 5. PRODUCT & CATALOG MANAGEMENT

Core product data:

- Product ID
- Product name
- Slug
- SKU
- Category
- Collection
- Description
- Material
- Care instruction
- Price
- Compare-at price
- Cost price if needed
- Images
- Weight
- Dimensions
- Status
- Featured
- SEO metadata

## Variants

Fashion wajib menggunakan variant-level stock.

Example:

```text
Oversized Hoodie Black
├── Black / S
├── Black / M
├── Black / L
└── Black / XL
```

Variant fields:

- variant ID,
- SKU,
- size,
- color,
- stock,
- optional barcode,
- weight override,
- status.

---

# 6. INVENTORY MANAGEMENT

Jangan hanya menggunakan field `stock`.

Gunakan inventory movement / ledger.

```text
+50 RESTOCK
-1  ORDER
+1  RETURN
-2  DAMAGED
-1  MANUAL_ADJUSTMENT
```

Core entities:

- InventoryItem
- InventoryMovement
- StockAdjustment
- StockReservation
- Warehouse/Location later if needed

Movement types:

- RESTOCK
- SALE
- RETURN
- DAMAGE
- CORRECTION
- MANUAL_ADJUSTMENT
- CANCELLATION
- RESERVED
- RELEASED

Minimum features:

- stock per variant,
- movement history,
- manual adjustment,
- low-stock warning,
- out-of-stock status,
- stock reports,
- search/filter.

---

# 7. SALES & ORDER OPERATIONS

Pisahkan order status, payment status, dan shipment status.

## Order Status

```text
PENDING
CONFIRMED
PROCESSING
PACKED
SHIPPED
DELIVERED
CANCELLED
RETURN_REQUESTED
RETURNED
```

## Payment Status

```text
PENDING
PAID
FAILED
EXPIRED
REFUNDED
PARTIALLY_REFUNDED
```

## Shipment Status

```text
PENDING
READY
PICKED_UP
IN_TRANSIT
DELIVERED
FAILED
RETURNED
```

Typical lifecycle:

```text
CART
 ↓
CHECKOUT
 ↓
PENDING_PAYMENT
 ↓
PAID
 ↓
PROCESSING
 ↓
PACKED
 ↓
SHIPPED
 ↓
DELIVERED
```

Alternative:

```text
CANCELLED
PAYMENT_FAILED
PAYMENT_EXPIRED
REFUNDED
RETURN_REQUESTED
RETURNED
```

Admin features:

- order list,
- search,
- filters,
- status update,
- customer detail,
- address,
- order items,
- payment status,
- shipping status,
- courier,
- tracking number,
- invoice,
- receipt,
- order notes,
- internal notes,
- refund,
- return,
- cancellation,
- activity timeline,
- export.

---

# 8. CUSTOMER MANAGEMENT

Admin can access:

- customer profile,
- email,
- phone,
- addresses,
- order history,
- total purchases,
- total spending,
- last purchase,
- wishlist,
- notes,
- chat history,
- return/refund history.

Future-ready:

- segmentation,
- VIP,
- member tiers,
- repeat customer,
- lifetime value,
- RFM analysis.

---

# 9. CUSTOMER DASHBOARD

Suggested routes:

```text
/account
/account/profile
/account/addresses
/account/orders
/account/orders/[id]
/account/wishlist
/account/recently-viewed
/account/notifications
/account/chat
```

Features:

- Profile
- Address Book
- Order History
- Order Detail
- Tracking
- Wishlist
- Recently Viewed
- Recently Purchased
- Buy Again
- Saved Items
- Notifications
- Chat / Support
- Return Request
- Refund Status
- Account Settings

---

# 10. PROMOTION & MARKETING

Minimum:

- fixed discount,
- percentage discount,
- voucher,
- minimum order,
- date range,
- product-specific discount,
- collection-specific discount,
- free shipping promo,
- homepage promo banner,
- featured campaign,
- new arrival,
- best seller,
- flash sale structure.

Future-ready:

- loyalty points,
- referral,
- member tier,
- birthday voucher,
- campaign automation,
- abandoned-cart promotion.

---

# 11. CHAT ADMIN ↔ CUSTOMER

Recommended features:

- realtime chat,
- unread indicator,
- message history,
- typing indicator,
- read receipt,
- attachments,
- linked product,
- linked order,
- admin inbox,
- open/resolved status,
- conversation search,
- customer profile sidebar.

If "E2E" means end-to-end flow, regular realtime support architecture is enough.

If later true end-to-end encryption is required, the architecture must change because the server cannot read message contents.

For V1:

- TLS in transit,
- authenticated access,
- secure storage,
- strict authorization.

---

# 12. NOTIFICATION CENTER

Customer:

- order created,
- payment confirmed,
- processing,
- packed,
- shipped,
- delivered,
- cancelled,
- refund,
- return update,
- chat reply.

Admin:

- new order,
- successful payment,
- failed payment,
- low stock,
- new chat,
- return request,
- refund request,
- system warning.

Initial channel:

- in-app notification.

Future:

- Email
- WhatsApp
- Push Notification

---

# 13. FINANCE & INTERNAL MANAGEMENT

V1 is not a full accounting ERP.

Core entities:

- Order
- Payment
- Revenue
- Expense
- Refund
- Invoice
- Receipt
- FinancialTransaction

Features:

- sales revenue,
- expenses,
- refunds,
- payment records,
- invoice,
- receipt,
- gross sales,
- net sales,
- simple profit,
- cashflow summary,
- date filters,
- product performance,
- sales report,
- export.

Future accounting phase may include:

- Chart of Accounts,
- General Ledger,
- Balance Sheet,
- Trial Balance,
- Accounts Payable,
- Accounts Receivable,
- Tax,
- Journal Entry.

---

# 14. REPORTING & ANALYTICS

Management dashboard:

- total orders,
- total revenue,
- average order value,
- new customers,
- repeat customers,
- best-selling products,
- top collections,
- low stock,
- out-of-stock,
- payment breakdown,
- shipping status,
- refund summary,
- revenue trend,
- order trend.

Filters:

- today,
- yesterday,
- 7 days,
- 30 days,
- custom date.

Export:

- CSV
- XLSX later
- PDF later

Business analytics must come from the application database, not GA4.

---

# 15. ROLE & PERMISSION

Initial roles:

```text
SUPERADMIN
OWNER
ADMIN
SALES
FINANCE
INVENTORY
CUSTOMER_SERVICE
CONTENT_ADMIN
CUSTOMER
```

RBAC must be enforced on the backend.

Do not only hide UI menus.

---

# 16. AUDIT LOG

Track important admin activity:

- actor,
- action,
- entity,
- entity ID,
- previous value,
- new value,
- timestamp,
- optional IP.

Examples:

- stock adjustment,
- order status changes,
- refunds,
- price changes,
- finance updates,
- role changes.

---

# 17. SYSTEM SETTINGS

Settings:

- Store identity
- Logo
- Brand colors
- Contact information
- Currency
- Timezone
- Invoice numbering
- Receipt numbering
- Order numbering
- Payment provider config
- Shipping provider config
- Email settings
- Notification settings
- Social links
- SEO defaults
- Maintenance mode
- Feature flags

---

# 18. FRONTEND STACK

Deploy: **Vercel**

Recommended:

```text
Next.js 16
React 19
TypeScript
Tailwind CSS 4
shadcn/ui
TanStack Query
Zustand
React Hook Form
Zod
Framer Motion
```

Responsibilities:

- storefront,
- customer dashboard,
- admin UI,
- CMS UI,
- operations UI.

Frontend communicates with backend via HTTPS / WSS.

---

# 19. BACKEND STACK

Backend runs fully on VPS.

Recommended:

```text
Node.js
Fastify
TypeScript
Drizzle ORM
PostgreSQL
Redis
BullMQ
Socket.IO / WebSocket
Zod
```

Alternative: NestJS if a more opinionated framework is needed.

Current recommendation:

> **Fastify + TypeScript + Drizzle**

---

# 20. DATABASE

Use:

# PostgreSQL

Run on VPS.

Core schema domains:

```text
users
roles
permissions
customers
addresses

products
product_variants
categories
collections
product_images

inventory_items
inventory_movements

carts
cart_items

orders
order_items
order_addresses

payments
payment_events
refunds

shipments
shipment_events

invoices
receipts
expenses
financial_transactions

wishlists
recently_viewed

conversations
messages

notifications

cms_pages
cms_sections
banners

promotions
coupons

audit_logs
system_settings
```

---

# 21. ARCHITECTURE STYLE

Use a **modular monolith**.

Do not introduce microservices initially.

Modules:

```text
auth
catalog
inventory
cart
checkout
orders
payments
shipping
customers
chat
cms
promotions
finance
reporting
notifications
admin
```

Recommended layers:

```text
Controller / Route
        ↓
Service
        ↓
Domain Logic
        ↓
Repository
        ↓
Database
```

Business logic should not live directly in routes/controllers or UI components.

---

# 22. REPOSITORY STRUCTURE

Recommended monorepo:

```text
fashion-commerce/
├── apps/
│   ├── web/
│   ├── api/
│   └── worker/
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── config/
│   └── shared/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   └── scripts/
│
├── docs/
└── README.md
```

Frontend:

```text
apps/web/src/
├── app/
│   ├── (storefront)/
│   ├── account/
│   └── admin/
├── components/
├── features/
├── hooks/
├── services/
├── stores/
├── types/
└── config/
```

Backend:

```text
apps/api/src/
├── modules/
│   ├── auth/
│   ├── catalog/
│   ├── inventory/
│   ├── orders/
│   ├── payments/
│   ├── shipping/
│   ├── customers/
│   ├── chat/
│   ├── finance/
│   └── reporting/
├── db/
├── middleware/
├── plugins/
├── config/
└── lib/
```

---

# 23. INFRASTRUCTURE

Target architecture:

```text
                    INTERNET
                       │
                 Cloudflare DNS
                       │
             ┌─────────┴─────────┐
             │                   │
         VERCEL                VPS
             │                   │
       Next.js Web          Nginx Proxy
                                 │
                ┌────────────────┼───────────────┐
                │                │               │
             API App          Worker         WebSocket
                │                │               │
                └──────────┬─────┴───────────────┘
                           │
                    PostgreSQL
                           │
                         Redis
                           │
                    Cloudflare R2
```

### Vercel

- Next.js frontend
- storefront UI
- customer dashboard UI
- admin UI

### VPS

- Fastify backend
- PostgreSQL
- Redis
- worker
- WebSocket
- cron jobs
- webhook processing
- business logic

### Cloudflare R2

Recommended for:

- product images,
- banners,
- invoices,
- receipts,
- chat attachments,
- documents.

---

# 24. DOMAIN STRUCTURE

Recommended:

```text
brand.com
brand.com/account
brand.com/admin
api.brand.com
```

Optional:

```text
ws.brand.com
```

but WebSocket may also use `api.brand.com`.

---

# 25. AUTHENTICATION

Backend owns authentication.

Recommended:

- email/password,
- optional OTP later,
- access token,
- refresh token,
- secure HTTP-only cookie where appropriate.

Avoid storing sensitive long-lived tokens in localStorage.

Cookie characteristics:

```text
HttpOnly
Secure
SameSite
```

Flow:

```text
POST api.brand.com/auth/login
        ↓
Backend Verify
        ↓
Create Session / Tokens
        ↓
Frontend authenticated
```

Backend validates every protected endpoint.

---

# 26. API DESIGN

Use REST for standard business operations.

Examples:

```text
GET    /api/v1/products
GET    /api/v1/products/:slug
POST   /api/v1/cart
POST   /api/v1/checkout

GET    /api/v1/me/orders
GET    /api/v1/me/orders/:id
GET    /api/v1/me/wishlist

GET    /api/v1/admin/orders
PATCH  /api/v1/admin/orders/:id/status

GET    /api/v1/admin/products
POST   /api/v1/admin/products
PATCH  /api/v1/admin/products/:id

GET    /api/v1/admin/inventory
POST   /api/v1/admin/inventory/adjustments

GET    /api/v1/admin/reports/overview
```

Use consistent API response shape.

---

# 27. CURRENT DEVELOPMENT STRATEGY

Current priority:

# PHASE 1 — FULL FRONTEND EXPERIENCE

Payment and shipping are still simulations.

Do not hardcode button behavior directly.

Bad:

```js
onClick={() => alert("Payment berhasil")}
```

Use provider abstraction.

Example:

```ts
interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<Payment>
  getPaymentStatus(id: string): Promise<PaymentStatus>
}
```

Current:

```text
MockPaymentProvider
```

Later:

```text
MidtransPaymentProvider
XenditPaymentProvider
```

Shipping:

```ts
interface ShippingProvider {
  getRates(input): Promise<ShippingRate[]>
  createShipment(input): Promise<Shipment>
  trackShipment(id): Promise<ShipmentTracking>
}
```

Current:

```text
MockShippingProvider
```

Later:

```text
RealShippingProvider
```

---

# 28. MOCK / SIMULATION REQUIREMENTS

Frontend phase must simulate:

- products,
- categories,
- collections,
- variants,
- stock,
- wishlist,
- cart,
- checkout,
- addresses,
- payment methods,
- courier selection,
- shipping fees,
- order creation,
- order success,
- tracking,
- order history,
- invoice,
- customer dashboard,
- admin orders,
- admin inventory,
- finance overview,
- reports,
- chat.

Mock services must be replaceable later without redesigning the UI.

---

# 29. PAYMENT ARCHITECTURE

Real implementation later:

```text
Customer
   ↓
Frontend
   ↓
Backend
   ↓
Payment Gateway
   ↓
Webhook
   ↓
Backend
   ↓
Update Payment
Update Order
Update Inventory
Notify Customer
```

Rules:

- provider secrets only on backend,
- payment creation via backend,
- webhook directly to VPS backend,
- verify webhook signature,
- idempotent processing,
- retry-safe.

---

# 30. SHIPPING ARCHITECTURE

```text
Frontend
   ↓
Backend
   ↓
Shipping Provider
```

Backend handles:

- shipping rates,
- courier/service selection,
- shipment creation,
- tracking,
- pickup requests,
- shipment synchronization.

Do not expose shipping provider secrets to the frontend.

---

# 31. REALTIME CHAT ARCHITECTURE

Recommended:

```text
Customer
   │
   │ WSS
   ▼
WebSocket Server
   │
   ├── Redis Pub/Sub
   └── PostgreSQL
```

Possible stack:

- Socket.IO
- Redis Pub/Sub
- PostgreSQL persistence

Use REST for history if useful.
Use WebSocket for realtime events.

---

# 32. REDIS

Redis may be used for:

- rate limiting,
- cache,
- sessions,
- Pub/Sub,
- temporary data,
- background jobs,
- distributed locks where required.

PostgreSQL remains the source of truth for durable business data.

---

# 33. BACKGROUND WORKERS

Use BullMQ or similar.

Worker tasks:

- invoice generation,
- receipt generation,
- email,
- WhatsApp notifications,
- webhook retries,
- shipping sync,
- low-stock alert,
- scheduled reports,
- abandoned cart,
- cleanup,
- campaign scheduling.

Avoid slow synchronous work in checkout requests.

---

# 34. FILE STORAGE

Recommended:

# Cloudflare R2

Store:

- product photos,
- banners,
- lookbooks,
- chat attachments,
- invoices,
- receipts,
- documents.

Database stores:

- object key,
- URL,
- MIME type,
- size,
- metadata.

Do not rely on VPS disk as the only long-term media storage.

---

# 35. VPS DEPLOYMENT

Recommended:

- Ubuntu
- Docker
- Docker Compose
- Nginx
- PostgreSQL
- Redis
- Node.js API
- Worker
- WebSocket
- Let's Encrypt / SSL
- Cloudflare DNS

Example services:

```text
api
worker
postgres
redis
nginx
```

---

# 36. NGINX

```text
api.brand.com
      ↓
Nginx
      ↓
API :3001
```

Responsibilities:

- SSL termination,
- reverse proxy,
- WebSocket upgrade,
- request limits,
- headers.

---

# 37. SECURITY BASELINE

Minimum:

- SSH key auth
- disable password SSH if possible
- disable root direct login
- UFW
- fail2ban
- HTTPS
- strict CORS
- Helmet
- rate limiting
- Zod validation
- RBAC
- audit logs
- secure cookies
- environment secrets
- database private
- Redis private
- input validation
- output escaping
- CSRF strategy where relevant
- XSS prevention
- SQL injection prevention
- webhook signature verification
- file MIME validation
- file extension validation
- upload size limits

Public ports ideally:

```text
22
80
443
```

Do not expose publicly:

```text
5432
6379
```

---

# 38. BACKUP STRATEGY

Daily PostgreSQL backups:

```text
PostgreSQL Dump
      ↓
Compress
      ↓
Upload to R2/S3
      ↓
Retention
```

Suggested retention:

- 7 daily
- 4 weekly
- optional monthly archive

Never keep the only backup on the same VPS.

---

# 39. MONITORING

Recommended:

- Sentry
- Uptime Kuma
- structured logging
- CPU/RAM/disk monitoring
- API health checks

Health routes:

```text
GET /health
GET /health/database
GET /health/redis
```

Future:

- Prometheus
- Grafana

---

# 40. OBSERVABILITY

Log:

- request ID,
- user ID,
- endpoint,
- response time,
- error,
- job ID,
- webhook ID.

Never log:

- passwords,
- access tokens,
- payment secrets,
- sensitive credentials.

---

# 41. TRANSACTION SAFETY

Critical flows use DB transactions:

- order creation,
- payment success,
- stock deduction,
- refund,
- inventory adjustment.

Example:

```text
BEGIN
  verify payment event
  update payment
  update order
  reserve/deduct inventory
  create financial transaction
  create notification
COMMIT
```

Use idempotency for duplicated webhooks or retryable requests.

---

# 42. STOCK CONSISTENCY

Recommended future flow:

```text
Checkout created
→ reserve stock
→ payment success
→ convert reservation to sold
```

If payment expires:

```text
release reserved stock
```

Implementation may be simplified in MVP, but architecture must not block this approach later.

---

# 43. FINANCIAL DOCUMENTS

Invoice and receipt should be generated from backend data.

Possible numbering:

```text
INV-YYYYMM-XXXX
RCT-YYYYMM-XXXX
```

Final format can be made configurable.

PDF generation may run in worker.

---

# 44. SEO

Storefront supports:

- SSR / Server Components
- metadata
- canonical
- OG metadata
- sitemap.xml
- robots.txt
- Product structured data
- Organization structured data
- Breadcrumb schema
- clean slugs
- image alt
- dynamic title/meta description

CMS should allow editing SEO data.

---

# 45. PERFORMANCE

Frontend:

- Next/Image
- image optimization
- lazy loading
- Server Components where appropriate
- avoid unnecessary client components
- cache catalog data appropriately

Backend:

- pagination,
- indexed queries,
- selective joins,
- Redis only where beneficial.

Important indexes:

- product slug,
- SKU,
- order number,
- customer email,
- created_at,
- payment reference,
- tracking number.

---

# 46. RESPONSIVE DESIGN

Priority:

1. Mobile
2. Desktop
3. Tablet

Customer experience should be strongly mobile optimized.

Admin dashboard should remain comfortable on desktop and tablet.

---

# 47. UI / UX DIRECTION

Storefront:

- fashion editorial,
- modern,
- premium,
- minimal,
- bold typography,
- strong campaign imagery,
- clean product cards,
- elegant transitions,
- strong spacing hierarchy.

Avoid:

- generic SaaS storefront,
- clutter,
- excessive gradients,
- overly template-like ecommerce UI.

Admin may be more functional and dashboard-oriented.

---

# 48. DEVELOPMENT PHASES

## Phase 1 — Discovery & UI Foundation

- ask Hammad for brand info,
- collect product data,
- define visual references,
- define routes,
- define design system,
- create mock data.

## Phase 2 — Frontend Storefront

- Homepage
- Shop
- Collection
- Product
- Wishlist
- Cart
- Checkout
- Order success
- Static pages

## Phase 3 — Customer Portal

- Login UI
- Profile
- Address
- Wishlist
- Orders
- Tracking
- Notifications
- Chat

## Phase 4 — Admin Frontend

- Overview
- CMS
- Products
- Inventory
- Orders
- Customers
- Chat
- Finance
- Reports
- Settings

## Phase 5 — Backend Core

- PostgreSQL
- Drizzle
- Fastify
- Auth
- RBAC
- Catalog
- Customer
- Cart
- Orders
- Inventory

## Phase 6 — Realtime / Worker / Internal

- Redis
- Worker
- WebSocket
- Notifications
- Audit logs

## Phase 7 — Payment & Shipping

- payment provider
- shipping provider
- webhooks
- tracking
- shipping rates
- pickup support if available

## Phase 8 — Testing & Production

- integration tests
- UAT
- VPS deployment
- monitoring
- backups
- go-live

---

# 49. QUESTIONS AI DEVELOPER MUST ASK HAMMAD

The AI developer must **not invent missing brand or business data**.

For initial frontend phase, ask Hammad directly if missing:

1. Nama brand?
2. Logo?
3. Warna brand?
4. Font brand?
5. Referensi website/style?
6. Foto produk?
7. Nama produk?
8. Harga produk?
9. Deskripsi produk?
10. Kategori?
11. Variant size/color?
12. Size chart?
13. Foto campaign/banner/lookbook?
14. Tagline?
15. About brand?
16. WhatsApp?
17. Instagram/TikTok?
18. Email?

Do not block initial frontend work with later integration questions.

Ask later when backend/integration phase begins:

- payment gateway,
- payment methods,
- shipping provider,
- pickup address,
- courier preferences,
- settlement account,
- real stock values,
- staff/admin roles,
- invoice numbering,
- receipt numbering,
- finance categories,
- notification channels,
- domain,
- VPS access,
- Cloudflare/DNS,
- object storage,
- email provider,
- WhatsApp provider.

---

# 50. AI DEVELOPER RULES

1. Do not casually change the architecture.
2. Do not replace VPS backend with serverless backend unless Hammad approves.
3. Frontend remains deployable to Vercel.
4. Backend remains deployable to VPS.
5. Database remains PostgreSQL.
6. Use modular monolith.
7. Do not prematurely introduce microservices.
8. Do not hardcode payment/shipping logic in UI.
9. Use provider abstraction.
10. Keep order/payment/shipment states separate.
11. Use variant-level inventory.
12. Use inventory movement history.
13. Protect admin actions with backend permissions.
14. Never trust client-side authorization.
15. Use transactions for critical flows.
16. Implement idempotency for webhook/payment flows.
17. Keep API secrets only on backend.
18. Use R2/S3-style durable storage for uploads.
19. Do not expose PostgreSQL or Redis publicly.
20. Build frontend with realistic mock services first.
21. Ask Hammad when brand/business data is missing.
22. Do not invent client data.
23. Keep architecture ready for future expansion.
24. Avoid unnecessary overengineering.
25. Prioritize maintainability and clarity.

---

# 51. FINAL TECH STACK SUMMARY

## Frontend

```text
Next.js 16
React 19
TypeScript
Tailwind CSS 4
shadcn/ui
TanStack Query
Zustand
React Hook Form
Zod
Framer Motion
Vercel
```

## Backend

```text
Node.js
Fastify
TypeScript
Drizzle ORM
PostgreSQL
Redis
BullMQ
Socket.IO / WebSocket
Zod
```

## Infrastructure

```text
Ubuntu VPS
Docker
Docker Compose
Nginx
Let's Encrypt
Cloudflare DNS
Cloudflare R2
```

## Monitoring

```text
Sentry
Uptime Kuma
Structured Logs
```

## Integrations

```text
Payment Gateway
Shipping Provider
Email Provider
WhatsApp Provider
Analytics
```

---

# 52. HIGH-LEVEL SYSTEM MAP

```text
CUSTOMER
   │
   ▼
VERCEL
Next.js Frontend
   │
   │ HTTPS / WSS
   ▼
VPS
Nginx
   │
   ├── Fastify API
   ├── Worker
   ├── WebSocket
   │
   ├── PostgreSQL
   └── Redis
          │
          ├── Cloudflare R2
          ├── Payment Gateway
          ├── Shipping Provider
          ├── Email Provider
          └── WhatsApp Provider
```

---

# 53. ADMIN SYSTEM MAP

```text
/admin
│
├── Dashboard
├── CMS
├── Products
├── Categories
├── Collections
├── Inventory
├── Orders
├── Customers
├── Chat
├── Promotions
├── Finance
├── Reports
├── Notifications
├── Users & Roles
├── Audit Logs
└── Settings
```

---

# 54. CUSTOMER SYSTEM MAP

```text
/
├── Home
├── Shop
├── Collections
├── Product
├── Lookbook
├── About
├── Contact
├── FAQ
├── Wishlist
├── Cart
├── Checkout
└── Account
    ├── Profile
    ├── Addresses
    ├── Orders
    ├── Tracking
    ├── Wishlist
    ├── Recently Viewed
    ├── Notifications
    └── Chat
```

---

# 55. DEFINITION OF SUCCESS

Project dianggap berhasil apabila:

- customer dapat menjelajah brand dan produk dengan UX fashion modern,
- customer dapat menjalankan full buying flow,
- customer mempunyai account dashboard,
- admin dapat mengelola konten tanpa code,
- admin dapat mengelola product/variant/stock,
- admin dapat memproses order end-to-end,
- admin dapat melihat dan mengelola customer,
- admin dan customer dapat berkomunikasi,
- management dapat melihat finance dan reports,
- payment/shipping dapat diganti dari mock ke real provider tanpa rewrite UI besar,
- backend stabil di VPS,
- frontend stabil di Vercel,
- architecture dapat berkembang tanpa rewrite total.

---

# 56. DEVELOPMENT PHILOSOPHY

> **Simple infrastructure, strong domain boundaries.**

> **Frontend-first, integration-ready.**

> **Modular monolith now, service extraction only when scale actually requires it.**

> **VPS for control, Vercel for frontend delivery.**

> **Business logic lives in backend services, not UI components.**

> **Mock first, real provider later — without rewriting the product.**

---

# END OF MASTER BLUEPRINT

Dokumen ini menjadi acuan utama AI developer sebelum membuat perubahan besar terhadap architecture, modules, database, integration pattern, atau deployment strategy.

Jika requirement bisnis belum jelas:

> **Ask Hammad before assuming.**
