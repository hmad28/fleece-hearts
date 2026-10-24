CREATE TABLE IF NOT EXISTS account_profiles (
  user_id text PRIMARY KEY,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS account_saved_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  label text NOT NULL,
  recipient_name text NOT NULL,
  phone text NOT NULL,
  province text NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  postal_code text NOT NULL,
  line1 text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS account_saved_addresses_user_idx ON account_saved_addresses(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS account_saved_addresses_default_idx ON account_saved_addresses(user_id) WHERE is_default;

INSERT INTO account_saved_addresses (user_id, label, recipient_name, phone, province, city, district, postal_code, line1, is_default)
SELECT user_id, 'Utama', recipient_name, phone, province, city, district, postal_code, line1, true
FROM account_addresses old
WHERE NOT EXISTS (SELECT 1 FROM account_saved_addresses saved WHERE saved.user_id = old.user_id);

CREATE TABLE IF NOT EXISTS account_wishlist (
  user_id text NOT NULL,
  product_id text NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS account_wishlist_user_idx ON account_wishlist(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS account_payment_preferences (
  user_id text PRIMARY KEY,
  method_code text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
