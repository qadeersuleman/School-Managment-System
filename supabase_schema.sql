-- ==============================================================================
-- Supabase PostgreSQL Schema for SMS (Student Management System)
-- ==============================================================================
-- How to run:
-- 1. In your Supabase Dashboard, open your project ("sms").
-- 2. Click "SQL Editor" in the left sidebar.
-- 3. Click "New query", paste this entire script, and click "Run".
-- ==============================================================================

-- 1. User Profiles / Accounts
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('Admin', 'Teacher', 'Student')) DEFAULT 'Student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update check constraint if table already exists from previous runs
DO $$
BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('Admin', 'Teacher', 'Student'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY, -- e.g. 'STU-0001'
  name TEXT NOT NULL,
  father_name TEXT,
  class TEXT,
  phone TEXT,
  gender TEXT DEFAULT 'Male',
  dob DATE,
  address TEXT,
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY, -- e.g. 'TCH-0001'
  name TEXT NOT NULL,
  subject TEXT,
  phone TEXT,
  salary NUMERIC(12, 2) DEFAULT 0,
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY, -- e.g. 'CLS-0001'
  name TEXT NOT NULL,
  section TEXT DEFAULT 'A',
  teacher TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Fees Table
CREATE TABLE IF NOT EXISTS fees (
  id TEXT PRIMARY KEY, -- e.g. 'FEE-0001'
  student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  fee_month TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_date DATE,
  status TEXT CHECK (status IN ('Paid', 'Pending')) DEFAULT 'Paid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('Present', 'Absent', 'Leave')) DEFAULT 'Present',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Activity Logs Table
CREATE TABLE IF NOT EXISTS activities (
  id BIGSERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  activity TEXT NOT NULL,
  user_name TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Allow full access for API clients using anon key (ideal for development & direct frontend use)
DROP POLICY IF EXISTS "Allow public access to profiles" ON profiles;
CREATE POLICY "Allow public access to profiles" ON profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to students" ON students;
CREATE POLICY "Allow public access to students" ON students FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to teachers" ON teachers;
CREATE POLICY "Allow public access to teachers" ON teachers FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to classes" ON classes;
CREATE POLICY "Allow public access to classes" ON classes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to fees" ON fees;
CREATE POLICY "Allow public access to fees" ON fees FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to attendance" ON attendance;
CREATE POLICY "Allow public access to attendance" ON attendance FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to activities" ON activities;
CREATE POLICY "Allow public access to activities" ON activities FOR ALL USING (true);

-- Insert Default Profiles (Admin, Teacher, Student)
INSERT INTO profiles (id, name, email, role)
VALUES 
  ('USR-000001', 'System Admin', 'admin@sms.com', 'Admin'),
  ('USR-000002', 'Sir Ahmed Khan', 'teacher@sms.com', 'Teacher'),
  ('USR-000003', 'Ali Raza', 'student@sms.com', 'Student')
ON CONFLICT (email) DO UPDATE SET 
  role = EXCLUDED.role, 
  name = EXCLUDED.name;
