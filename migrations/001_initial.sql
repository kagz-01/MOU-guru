-- migrations/001_initial.sql
-- Initial schema for MOU-Guru
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mou_status') THEN
    CREATE TYPE mou_status AS ENUM ('Draft','Pending Approval','Active','Expired','Terminated','Renewed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'milestone_status') THEN
    CREATE TYPE milestone_status AS ENUM ('Pending','In Progress','Done','Missed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS departments (
  department_id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS app_users (
  user_id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin','editor','viewer')) DEFAULT 'viewer',
  password_hash TEXT
);

CREATE TABLE IF NOT EXISTS parties (
  party_id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  type TEXT
);

CREATE TABLE IF NOT EXISTS contacts (
  contact_id BIGSERIAL PRIMARY KEY,
  party_id BIGINT REFERENCES parties(party_id) ON DELETE CASCADE,
  fullname TEXT NOT NULL,
  position TEXT,
  email TEXT,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS mous (
  mou_id BIGSERIAL PRIMARY KEY,
  reference_no TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status mou_status NOT NULL DEFAULT 'Draft',
  governing_law TEXT,
  confidentiality BOOLEAN DEFAULT FALSE,
  ip_terms TEXT,
  renewal_terms TEXT,
  termination_clause TEXT,
  owning_department_id BIGINT REFERENCES departments(department_id),
  created_by BIGINT REFERENCES app_users(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT date_window CHECK (end_date > start_date)
);

CREATE TABLE IF NOT EXISTS mou_parties (
  mou_id BIGINT REFERENCES mous(mou_id) ON DELETE CASCADE,
  party_id BIGINT REFERENCES parties(party_id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  PRIMARY KEY (mou_id, party_id)
);

CREATE TABLE IF NOT EXISTS signatories (
  signatory_id BIGSERIAL PRIMARY KEY,
  mou_id BIGINT REFERENCES mous(mou_id) ON DELETE CASCADE,
  party_id BIGINT REFERENCES parties(party_id) ON DELETE SET NULL,
  contact_id BIGINT REFERENCES contacts(contact_id) ON DELETE SET NULL,
  name TEXT,
  title TEXT,
  signed_on DATE,
  signature_file_url TEXT
);

CREATE TABLE IF NOT EXISTS attachments (
  attachment_id BIGSERIAL PRIMARY KEY,
  mou_id BIGINT REFERENCES mous(mou_id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('Draft','Signed','Annex','Amendment','Other')) DEFAULT 'Other',
  file_name TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  uploaded_by BIGINT REFERENCES app_users(user_id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS amendments (
  amendment_id BIGSERIAL PRIMARY KEY,
  mou_id BIGINT REFERENCES mous(mou_id) ON DELETE CASCADE,
  amendment_no INT NOT NULL,
  description TEXT,
  effective_date DATE,
  file_url TEXT,
  UNIQUE (mou_id, amendment_no)
);

CREATE TABLE IF NOT EXISTS milestones (
  milestone_id BIGSERIAL PRIMARY KEY,
  mou_id BIGINT REFERENCES mous(mou_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  responsible_party_id BIGINT REFERENCES parties(party_id),
  status milestone_status NOT NULL DEFAULT 'Pending',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS reminders (
  reminder_id BIGSERIAL PRIMARY KEY,
  mou_id BIGINT REFERENCES mous(mou_id) ON DELETE CASCADE,
  kind TEXT CHECK (kind IN ('Expiry','Milestone','Custom')) NOT NULL,
  fire_on TIMESTAMPTZ NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT FALSE,
  channel TEXT CHECK (channel IN ('Email','SMS','Webhook','None')) DEFAULT 'Email'
);

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id BIGINT NOT NULL,
  action TEXT CHECK (action IN ('INSERT','UPDATE','DELETE')) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by BIGINT REFERENCES app_users(user_id),
  diff JSONB
);

CREATE INDEX IF NOT EXISTS idx_mous_status ON mous(status);
CREATE INDEX IF NOT EXISTS idx_mous_end_date ON mous(end_date);
CREATE INDEX IF NOT EXISTS idx_mou_parties_party ON mou_parties(party_id);
CREATE INDEX IF NOT EXISTS idx_contacts_party ON contacts(party_id);
CREATE INDEX IF NOT EXISTS idx_milestones_due ON milestones(due_date, status);
CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(fire_on) WHERE sent = FALSE;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mous_updated_at ON mous;
CREATE TRIGGER trg_mous_updated_at
BEFORE UPDATE ON mous
FOR EACH ROW EXECUTE FUNCTION set_updated_at();



-- Add full-text search capabilities
ALTER TABLE mous ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_mous_search ON mous USING gin(search_vector);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION mou_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.reference_no, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mous_search_update ON mous;
CREATE TRIGGER trg_mous_search_update
BEFORE INSERT OR UPDATE ON mous
FOR EACH ROW EXECUTE FUNCTION mou_search_vector_update();

-- Create reporting views
CREATE OR REPLACE VIEW mou_dashboard_stats AS
SELECT 
  COUNT(*) as total_mous,
  COUNT(*) FILTER (WHERE status = 'Active') as active_mous,
  COUNT(*) FILTER (WHERE status = 'Expired') as expired_mous,
  COUNT(*) FILTER (WHERE end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') as expiring_soon,
  COUNT(*) FILTER (WHERE status = 'Draft') as draft_mous
FROM mous;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_mous_owning_department ON mous(owning_department_id);
CREATE INDEX IF NOT EXISTS idx_mous_created_by ON mous(created_by);
CREATE INDEX IF NOT EXISTS idx_milestones_responsible ON milestones(responsible_party_id);
CREATE INDEX IF NOT EXISTS idx_attachments_mou_category ON attachments(mou_id, category);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);

-- Function to automatically update search vectors for existing data
CREATE OR REPLACE FUNCTION refresh_all_search_vectors() RETURNS void AS $$
BEGIN
  UPDATE mous SET search_vector = 
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(reference_no, '')), 'A')
  WHERE search_vector IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to get MOU expiry notifications
CREATE OR REPLACE FUNCTION get_upcoming_expiries(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE(
  mou_id BIGINT,
  reference_no TEXT,
  title TEXT,
  end_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.mou_id,
    m.reference_no,
    m.title,
    m.end_date,
    (m.end_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM mous m
  WHERE m.status = 'Active'
    AND m.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + (days_ahead || ' days')::INTERVAL
  ORDER BY m.end_date ASC;
END;
$$ LANGUAGE plpgsql;
