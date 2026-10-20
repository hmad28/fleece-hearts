CREATE TABLE IF NOT EXISTS admin_staff (
  email text PRIMARY KEY,
  user_id text UNIQUE,
  role text NOT NULL CHECK (role IN ('OWNER','ADMIN')),
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_staff_email_lower CHECK (email = lower(email))
);

INSERT INTO admin_staff (email, role) VALUES ('fleecehearts@gmail.com', 'OWNER')
ON CONFLICT (email) DO NOTHING;
