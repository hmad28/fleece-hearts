CREATE TABLE IF NOT EXISTS account_addresses (
  user_id text PRIMARY KEY,
  recipient_name text NOT NULL,
  phone text NOT NULL,
  province text NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  postal_code text NOT NULL,
  line1 text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
