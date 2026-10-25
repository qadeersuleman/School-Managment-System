-- Supabase PostgreSQL Schema for SMS (Student Management System)
-- Run this in the Supabase SQL Editor when you are ready to switch from LocalStorage to Supabase.

-- 1. Students Table
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

-- 2. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY, -- e.g. 'TCH-0001'
  name TEXT NOT NULL,
  subject TEXT,
  phone TEXT,
  salary NUMERIC(12, 2) DEFAULT 0,
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY, -- e.g. 'CLS-0001'
  name TEXT NOT NULL,
  section TEXT DEFAULT 'A',
  teacher TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Fees Table
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

-- 5. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('Present', 'Absent', 'Leave')) DEFAULT 'Present',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id BIGSERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  activity TEXT NOT NULL,
  user_name TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) if needed
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Default public access policy for development/testing
CREATE POLICY "Allow public read access" ON students FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON teachers FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON classes FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON fees FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON activities FOR ALL USING (true);

