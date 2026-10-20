CREATE TABLE IF NOT EXISTS catalog_products (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_drops (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id text NOT NULL REFERENCES catalog_products(id),
  variant_id text NOT NULL,
  delta integer NOT NULL,
  stock_after integer NOT NULL CHECK (stock_after >= 0),
  reason text NOT NULL,
  actor_user_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inventory_movements_product_time_idx ON inventory_movements(product_id, created_at DESC);

CREATE TABLE IF NOT EXISTS site_content (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_orders (
  id text PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  customer_user_id text,
  customer_email text NOT NULL,
  data jsonb NOT NULL,
  admin_override boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS demo_orders_customer_idx ON demo_orders(customer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS demo_orders_created_idx ON demo_orders(created_at DESC);

CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_user_id text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED')),
  last_customer_read_at timestamptz,
  last_admin_read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_conversations_updated_idx ON chat_conversations(updated_at DESC);

CREATE TABLE IF NOT EXISTS chat_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_user_id text NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('CUSTOMER', 'ADMIN')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_conversation_idx ON chat_messages(conversation_id, id);
