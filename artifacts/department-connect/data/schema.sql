-- =============================================================================
-- Department Connect — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================


-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role          AS ENUM ('student', 'admin', 'developer');
CREATE TYPE admin_sub_role     AS ENUM ('Lecturer', 'Course Representative', 'Department Executive');
CREATE TYPE account_status     AS ENUM ('active', 'pending', 'rejected', 'suspended');
CREATE TYPE class_status       AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE notif_category     AS ENUM ('lectures', 'big_events', 'small_events', 'extras');
CREATE TYPE notif_priority     AS ENUM ('high', 'normal');
CREATE TYPE contribution_status AS ENUM ('unpaid', 'pending', 'confirmed', 'rejected');
CREATE TYPE event_category     AS ENUM ('lecture', 'big_event', 'small_event', 'extra');


-- =============================================================================
-- PROFILES
-- One row per user. Extends Supabase auth.users.
-- Students: matric_number + level filled, staff_id NULL
-- Admins:   staff_id + sub_role filled, matric_number NULL
-- Developer: staff_id filled, sub_role NULL
-- =============================================================================

CREATE TABLE profiles (
  id                UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name        TEXT          NOT NULL,
  surname           TEXT          NOT NULL,
  role              user_role     NOT NULL,
  sub_role          admin_sub_role,                            -- admins only
  matric_number     TEXT          UNIQUE,                     -- students only
  staff_id          TEXT          UNIQUE,                     -- admins / developer
  level             TEXT,                                     -- students: '100L'–'500L'/'Graduated'
  department        TEXT          NOT NULL,
  phone             TEXT,
  email             TEXT,
  dob               DATE,
  status            account_status NOT NULL DEFAULT 'pending',
  birthday_privacy  BOOLEAN       NOT NULL DEFAULT FALSE,
  hide_year         BOOLEAN       NOT NULL DEFAULT FALSE,
  profile_picture   TEXT,                                     -- storage URL
  rejection_reason  TEXT,
  submitted_at      TIMESTAMPTZ,                              -- when student submitted registration
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role          ON profiles (role);
CREATE INDEX idx_profiles_status        ON profiles (status);
CREATE INDEX idx_profiles_level         ON profiles (level);
CREATE INDEX idx_profiles_department    ON profiles (department);
CREATE INDEX idx_profiles_matric        ON profiles (matric_number);

-- auto-bump updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();


-- =============================================================================
-- CLASSES
-- Each row is one scheduled lecture / lab session.
-- =============================================================================

CREATE TABLE classes (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code      TEXT          NOT NULL,
  course_name      TEXT          NOT NULL,
  lecturer_id      UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  date             DATE          NOT NULL,
  start_time       TEXT          NOT NULL,   -- e.g. "8:00 AM"
  end_time         TEXT          NOT NULL,   -- e.g. "10:00 AM"
  venue            TEXT          NOT NULL,
  status           class_status  NOT NULL DEFAULT 'upcoming',
  attendance_open  BOOLEAN       NOT NULL DEFAULT FALSE,
  attendance_count INT           NOT NULL DEFAULT 0,
  level            TEXT          NOT NULL,   -- target level, e.g. '300L'
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classes_date       ON classes (date);
CREATE INDEX idx_classes_level      ON classes (level);
CREATE INDEX idx_classes_status     ON classes (status);
CREATE INDEX idx_classes_lecturer   ON classes (lecturer_id);


-- =============================================================================
-- CLASS ATTENDEES
-- One row per student who scanned into a class session.
-- =============================================================================

CREATE TABLE class_attendees (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id       UUID        NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  matric_number  TEXT        NOT NULL,
  level          TEXT        NOT NULL,
  scan_time      TEXT        NOT NULL,   -- e.g. "8:02 AM" (display string)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_id, student_id)          -- one attendance mark per student per class
);

CREATE INDEX idx_class_attendees_class   ON class_attendees (class_id);
CREATE INDEX idx_class_attendees_student ON class_attendees (student_id);


-- =============================================================================
-- ATTENDANCE SUMMARY
-- Aggregated per-semester attendance for each student's courses.
-- Recalculate percentage whenever attended/total changes.
-- =============================================================================

CREATE TABLE attendance_summary (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  semester     SMALLINT NOT NULL CHECK (semester IN (1, 2)),
  course_code  TEXT    NOT NULL,
  course_name  TEXT    NOT NULL,
  attended     INT     NOT NULL DEFAULT 0 CHECK (attended >= 0),
  total        INT     NOT NULL DEFAULT 0 CHECK (total >= 0),
  percentage   NUMERIC(5, 2) GENERATED ALWAYS AS (
                 CASE WHEN total = 0 THEN 0
                      ELSE ROUND((attended::NUMERIC / total) * 100, 2)
                 END
               ) STORED,
  UNIQUE (student_id, semester, course_code)
);

CREATE INDEX idx_attendance_student  ON attendance_summary (student_id);
CREATE INDEX idx_attendance_semester ON attendance_summary (semester);


-- =============================================================================
-- NOTIFICATIONS  (student-facing)
-- student_id NULL = broadcast to ALL students of the target level/role.
-- Use target_level to scope broadcasts ('300L', 'All', etc.)
-- =============================================================================

CREATE TABLE notifications (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID           REFERENCES profiles(id) ON DELETE CASCADE,  -- NULL = broadcast
  target_level  TEXT,                                                       -- '300L' | 'All' | NULL
  category      notif_category NOT NULL,
  title         TEXT           NOT NULL,
  body          TEXT           NOT NULL,
  priority      notif_priority NOT NULL DEFAULT 'normal',
  is_read       BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_student    ON notifications (student_id);
CREATE INDEX idx_notifications_is_read    ON notifications (is_read);
CREATE INDEX idx_notifications_category   ON notifications (category);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);


-- =============================================================================
-- ADMIN NOTIFICATIONS  (admin/developer-facing)
-- admin_id NULL = broadcast to all admins.
-- =============================================================================

CREATE TABLE admin_notifications (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID           REFERENCES profiles(id) ON DELETE CASCADE,  -- NULL = broadcast
  icon        TEXT           NOT NULL,       -- Ionicons name, e.g. "card-outline"
  icon_color  TEXT           NOT NULL,       -- hex colour
  title       TEXT           NOT NULL,
  body        TEXT           NOT NULL,
  priority    notif_priority NOT NULL DEFAULT 'normal',
  is_read     BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_notifs_admin      ON admin_notifications (admin_id);
CREATE INDEX idx_admin_notifs_is_read    ON admin_notifications (is_read);
CREATE INDEX idx_admin_notifs_created_at ON admin_notifications (created_at DESC);


-- =============================================================================
-- CONTRIBUTIONS  (payment dues)
-- Each row is one payment item (e.g. "Class Dues — 1st Semester").
-- submitted_by_id links to the student who claimed payment.
-- =============================================================================

CREATE TABLE contributions (
  id                    UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT                NOT NULL,
  amount                NUMERIC(10, 2)      NOT NULL CHECK (amount > 0),
  status                contribution_status NOT NULL DEFAULT 'unpaid',
  deadline              DATE                NOT NULL,
  paid_date             DATE,
  level                 TEXT                NOT NULL,    -- target level
  description           TEXT,
  bank_name             TEXT                NOT NULL,
  account_number        TEXT                NOT NULL,
  account_name          TEXT                NOT NULL,
  rejection_reason      TEXT,
  -- payment claim snapshot (filled when student taps "I Have Paid")
  submitted_by_id       UUID                REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_by_name     TEXT,
  submitted_by_matric   TEXT,
  submitted_by_level    TEXT,
  submitted_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contributions_status ON contributions (status);
CREATE INDEX idx_contributions_level  ON contributions (level);

CREATE TRIGGER trg_contributions_updated
  BEFORE UPDATE ON contributions
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();


-- =============================================================================
-- EVENTS
-- Departmental events, meetings, football matches, etc.
-- =============================================================================

CREATE TABLE events (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT           NOT NULL,
  category          event_category NOT NULL,
  date              DATE           NOT NULL,
  time              TEXT           NOT NULL,   -- display string e.g. "9:00 AM"
  venue             TEXT           NOT NULL,
  description       TEXT           NOT NULL,
  target_audience   TEXT,                      -- 'All Students' | '300L' | etc.
  reminder_schedule TEXT,                      -- 'None' | '24 hours before' | etc.
  created_by        UUID           REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_date            ON events (date);
CREATE INDEX idx_events_target_audience ON events (target_audience);
CREATE INDEX idx_events_category        ON events (category);


-- =============================================================================
-- ANNOUNCEMENTS
-- Posted by admins, visible to students.
-- =============================================================================

CREATE TABLE announcements (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT        NOT NULL,
  body               TEXT        NOT NULL,
  posted_by_id       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  posted_by_display  TEXT        NOT NULL,   -- e.g. "James Adeleke (Dept. Executive)"
  category           TEXT        NOT NULL,   -- 'Academic' | 'Administrative' | 'Financial' | 'Social' | 'Urgent'
  target_audience    TEXT,                   -- 'All Students' | '300L' | etc.
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_target    ON announcements (target_audience);
CREATE INDEX idx_announcements_category  ON announcements (category);
CREATE INDEX idx_announcements_created   ON announcements (created_at DESC);


-- =============================================================================
-- AUDIT LOGS
-- Immutable activity trail. Never update or delete rows.
-- =============================================================================

CREATE TABLE audit_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action        TEXT        NOT NULL,   -- e.g. "Login", "Payment Confirmed"
  user_id       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  user_display  TEXT        NOT NULL,   -- snapshot of name at the time
  role          TEXT        NOT NULL,   -- snapshot of role at the time
  details       TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user       ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);


-- =============================================================================
-- ROW LEVEL SECURITY  (RLS)
-- Enable on every table. Policies follow the pattern:
--   students   → can read/write their own rows
--   admins     → can read/write rows for their level/department
--   developer  → full access (service role used for admin ops)
-- Adjust policies to match your exact rules before going live.
-- =============================================================================

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_attendees      ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_summary   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;

-- Helper: get the role of the currently logged-in user
CREATE OR REPLACE FUNCTION my_role()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT role::TEXT FROM profiles WHERE id = auth.uid();
$$;

-- ── PROFILES ──────────────────────────────────────────────────────────────────
-- Everyone can read all profiles (needed for admin UI to list students)
CREATE POLICY "profiles: authenticated read all"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins and developers can update any profile (approve/reject students)
CREATE POLICY "profiles: admin update any"
  ON profiles FOR UPDATE TO authenticated
  USING (my_role() IN ('admin', 'developer'));

-- Only the system (service role) inserts profiles — done via trigger or API
CREATE POLICY "profiles: insert own"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- ── CLASSES ───────────────────────────────────────────────────────────────────
CREATE POLICY "classes: authenticated read"
  ON classes FOR SELECT TO authenticated USING (true);

CREATE POLICY "classes: admin insert"
  ON classes FOR INSERT TO authenticated
  WITH CHECK (my_role() IN ('admin', 'developer'));

CREATE POLICY "classes: admin update"
  ON classes FOR UPDATE TO authenticated
  USING (my_role() IN ('admin', 'developer'));

-- ── CLASS ATTENDEES ───────────────────────────────────────────────────────────
CREATE POLICY "class_attendees: admin read all"
  ON class_attendees FOR SELECT TO authenticated
  USING (my_role() IN ('admin', 'developer'));

CREATE POLICY "class_attendees: student read own"
  ON class_attendees FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "class_attendees: student insert own"
  ON class_attendees FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

-- ── ATTENDANCE SUMMARY ────────────────────────────────────────────────────────
CREATE POLICY "attendance_summary: student read own"
  ON attendance_summary FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "attendance_summary: admin read all"
  ON attendance_summary FOR SELECT TO authenticated
  USING (my_role() IN ('admin', 'developer'));

CREATE POLICY "attendance_summary: admin write"
  ON attendance_summary FOR ALL TO authenticated
  USING (my_role() IN ('admin', 'developer'));

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
-- Students see their own + broadcasts (student_id IS NULL)
CREATE POLICY "notifications: student read"
  ON notifications FOR SELECT TO authenticated
  USING (
    my_role() = 'student' AND (student_id = auth.uid() OR student_id IS NULL)
  );

CREATE POLICY "notifications: student update own"
  ON notifications FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "notifications: admin write"
  ON notifications FOR ALL TO authenticated
  USING (my_role() IN ('admin', 'developer'));

-- ── ADMIN NOTIFICATIONS ───────────────────────────────────────────────────────
CREATE POLICY "admin_notifs: admin read own"
  ON admin_notifications FOR SELECT TO authenticated
  USING (
    my_role() IN ('admin', 'developer') AND (admin_id = auth.uid() OR admin_id IS NULL)
  );

CREATE POLICY "admin_notifs: admin update own"
  ON admin_notifications FOR UPDATE TO authenticated
  USING (admin_id = auth.uid());

CREATE POLICY "admin_notifs: admin insert"
  ON admin_notifications FOR INSERT TO authenticated
  WITH CHECK (my_role() IN ('admin', 'developer'));

-- ── CONTRIBUTIONS ─────────────────────────────────────────────────────────────
CREATE POLICY "contributions: authenticated read"
  ON contributions FOR SELECT TO authenticated USING (true);

CREATE POLICY "contributions: admin insert"
  ON contributions FOR INSERT TO authenticated
  WITH CHECK (my_role() IN ('admin', 'developer'));

-- Students can only update the submitted_by fields (claiming payment)
CREATE POLICY "contributions: student submit payment"
  ON contributions FOR UPDATE TO authenticated
  USING (my_role() = 'student' AND status = 'unpaid')
  WITH CHECK (my_role() = 'student');

-- Admins can update any contribution (confirm/reject)
CREATE POLICY "contributions: admin update"
  ON contributions FOR UPDATE TO authenticated
  USING (my_role() IN ('admin', 'developer'));

-- ── EVENTS ────────────────────────────────────────────────────────────────────
CREATE POLICY "events: authenticated read"
  ON events FOR SELECT TO authenticated USING (true);

CREATE POLICY "events: admin write"
  ON events FOR ALL TO authenticated
  USING (my_role() IN ('admin', 'developer'));

-- ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
CREATE POLICY "announcements: authenticated read"
  ON announcements FOR SELECT TO authenticated USING (true);

CREATE POLICY "announcements: admin write"
  ON announcements FOR ALL TO authenticated
  USING (my_role() IN ('admin', 'developer'));

-- ── AUDIT LOGS ────────────────────────────────────────────────────────────────
CREATE POLICY "audit_logs: developer read"
  ON audit_logs FOR SELECT TO authenticated
  USING (my_role() = 'developer');

CREATE POLICY "audit_logs: insert any authenticated"
  ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);   -- any logged-in action can write a log row


-- =============================================================================
-- TRIGGER: auto-create profile row when auth.users row is inserted
-- Supabase calls this whenever a user signs up via Auth.
-- It pre-fills only the fields available from the auth metadata.
-- The registration flow must then UPDATE the profile with full details.
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, surname, email, role, department, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'surname', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();


-- =============================================================================
-- SEED DATA  (demo rows — delete before going live)
-- Passwords are managed by Supabase Auth. Create the auth.users rows first
-- via the Supabase dashboard or API, then these profiles link automatically.
-- The UUIDs below are placeholders — replace with real auth.users UUIDs.
-- =============================================================================

-- Students
INSERT INTO profiles (id, first_name, surname, role, matric_number, level, department, phone, email, dob, status, birthday_privacy, hide_year)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Tolu',      'Adeyemi',  'student', 'ART2500001', '300L', 'Computer Science', '08012345678', 'tolu.adeyemi@example.com', '1998-03-15', 'active',   true,  true),
  ('00000000-0000-0000-0000-000000000002', 'Chidi',     'Okonkwo',  'student', 'ART2500002', '300L', 'Computer Science', '08023456789', 'chidi@example.com',          '1998-07-22', 'active',   false, false),
  ('00000000-0000-0000-0000-000000000003', 'Fatima',    'Bello',    'student', 'ART2500003', '200L', 'Computer Science', '08034567890', '',                           '2000-11-05', 'pending',  false, false),
  ('00000000-0000-0000-0000-000000000004', 'Peter',     'Nwosu',    'student', 'ART2500004', '400L', 'Computer Science', '08045678901', 'peter@example.com',          '1997-05-18', 'active',   true,  false),
  ('00000000-0000-0000-0000-000000000005', 'Kemi',      'Adesanya', 'student', 'ART2500005', '100L', 'Computer Science', '08056789012', '',                           '2002-01-30', 'rejected', false, false),
  ('00000000-0000-0000-0000-000000000006', 'Emmanuel',  'Obi',      'student', 'ART2500006', '300L', 'Computer Science', '08067890123', '',                           '1998-09-12', 'pending',  false, false),
  ('00000000-0000-0000-0000-000000000007', 'Rukayat',   'Lawal',    'student', 'ART2500007', '200L', 'Computer Science', '08078901234', 'rukayat@example.com',        '2000-04-25', 'active',   true,  true),
  ('00000000-0000-0000-0000-000000000008', 'Michael',   'Eze',      'student', 'ART2500008', '400L', 'Computer Science', '08089012345', 'michael@example.com',        '1997-12-03', 'active',   true,  false);

UPDATE profiles SET rejection_reason = 'Invalid matric number format provided. Please resubmit.'
  WHERE id = '00000000-0000-0000-0000-000000000005';

UPDATE profiles SET submitted_at = '2026-06-18 00:00:00+00' WHERE id = '00000000-0000-0000-0000-000000000003';
UPDATE profiles SET submitted_at = '2026-06-17 00:00:00+00' WHERE id = '00000000-0000-0000-0000-000000000006';

-- Admins
INSERT INTO profiles (id, first_name, surname, role, sub_role, staff_id, level, department, phone, email, status)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'Yusuf',  'Ibrahim', 'admin', 'Lecturer',               'LEC001', NULL,  'Computer Science', '08011223344', 'yusuf.ibrahim@csc.edu',  'active'),
  ('00000000-0000-0000-0000-000000000102', 'Sandra', 'Okafor',  'admin', 'Course Representative',  'REP001', '300L','Computer Science', '08022334455', 'sandra.okafor@csc.edu',  'active'),
  ('00000000-0000-0000-0000-000000000103', 'James',  'Adeleke', 'admin', 'Department Executive',   'EXE001', NULL,  'Computer Science', '08033445566', 'james.adeleke@csc.edu',  'active');

-- Developer
INSERT INTO profiles (id, first_name, surname, role, staff_id, department, phone, email, status)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'Dev', 'Martins', 'developer', 'DEV001', 'System', '08099887766', 'dev@departmentconnect.ng', 'active');

-- Classes
INSERT INTO classes (id, course_code, course_name, lecturer_id, date, start_time, end_time, venue, status, attendance_open, attendance_count, level)
VALUES
  ('cl000000-0000-0000-0000-000000000001', 'CSC301', 'Data Structures',      '00000000-0000-0000-0000-000000000101', '2026-06-20', '8:00 AM',  '10:00 AM', 'LT1', 'completed', false, 18, '300L'),
  ('cl000000-0000-0000-0000-000000000002', 'CSC305', 'Software Engineering', '00000000-0000-0000-0000-000000000101', '2026-06-20', '10:00 AM', '12:00 PM', 'LT2', 'completed', false, 21, '300L'),
  ('cl000000-0000-0000-0000-000000000003', 'CSC309', 'Computer Networks',    '00000000-0000-0000-0000-000000000102', '2026-06-20', '2:00 PM',  '4:00 PM',  'LT1', 'ongoing',   true,  14, '300L'),
  ('cl000000-0000-0000-0000-000000000004', 'CSC311', 'Database Systems',     '00000000-0000-0000-0000-000000000101', '2026-06-19', '8:00 AM',  '10:00 AM', 'LT3', 'completed', false, 20, '300L'),
  ('cl000000-0000-0000-0000-000000000005', 'CSC313', 'Computer Architecture','00000000-0000-0000-0000-000000000102', '2026-06-19', '12:00 PM', '2:00 PM',  'LT2', 'completed', false, 17, '300L');

-- Attendance summary — Tolu (s1), Semester 1
INSERT INTO attendance_summary (student_id, semester, course_code, course_name, attended, total)
VALUES
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC301', 'Data Structures',       18, 20),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC303', 'Software Engineering',  14, 18),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC305', 'Computer Networks',     12, 15),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC307', 'Database Systems',      16, 20),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC309', 'Computer Architecture', 9,  12),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC311', 'Discrete Mathematics',  11, 16),
  ('00000000-0000-0000-0000-000000000001', 1, 'GST301', 'Entrepreneurship',      15, 18),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC313', 'Systems Programming',   8,  14),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC302', 'Theory of Computation', 16, 19),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC304', 'Operating Systems',     13, 18),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC306', 'Compiler Design',       10, 16),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC308', 'Artificial Intelligence',17,20),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC310', 'Computer Graphics',     14, 17),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC312', 'Information Systems',   11, 18),
  ('00000000-0000-0000-0000-000000000001', 2, 'GST302', 'Technical Writing',     16, 18),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC314', 'Numerical Analysis',    9,  15);

-- Contributions
INSERT INTO contributions (id, title, amount, status, deadline, paid_date, level, description, bank_name, account_number, account_name, submitted_by_id, submitted_by_name, submitted_by_matric, submitted_by_level, submitted_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Class Dues — 1st Semester', 5000, 'confirmed', '2026-01-31', '2026-01-20', '300L', 'Mandatory semester dues covering departmental expenses and student welfare.',            'First Bank',   '3012345678', 'CS Dept Student Fund',    NULL, NULL, NULL, NULL, NULL),
  ('c0000000-0000-0000-0000-000000000002', 'Departmental Week Fund',    3000, 'unpaid',    '2026-07-01', NULL,         '300L', 'Contribution towards the annual departmental week celebration, events, and logistics.', 'GTBank',       '0123456789', 'CS Dept Events Fund',     NULL, NULL, NULL, NULL, NULL),
  ('c0000000-0000-0000-0000-000000000003', 'Course Materials Fund',     2500, 'pending',   '2026-02-28', NULL,         '300L', 'Funds for printing course materials, lab supplies, and shared academic resources.',     'Access Bank',  '0987654321', 'CS Dept Materials Fund',  '00000000-0000-0000-0000-000000000001', 'Tolu Adeyemi', 'ART2500001', '300L', '2026-06-20 08:30:00+00'),
  ('c0000000-0000-0000-0000-000000000004', 'Exam Clearance Fee',        1500, 'unpaid',    '2026-06-28', NULL,         '300L', 'Required fee for examination clearance. Must be paid before exam period begins.',        'Zenith Bank',  '2109876543', 'CS Dept Admin Fund',      NULL, NULL, NULL, NULL, NULL);

-- Events
INSERT INTO events (id, title, category, date, time, venue, description, target_audience, reminder_schedule, created_by)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Departmental Week',          'big_event',   '2026-06-27', '9:00 AM',  'Faculty Building',     'Annual departmental week celebration with games, talks, and exhibitions. All students must attend.', 'All Students', 'Both',             '00000000-0000-0000-0000-000000000103'),
  ('e0000000-0000-0000-0000-000000000002', '300L WhatsApp Meeting',      'small_event', '2026-06-21', '3:00 PM',  'Online (WhatsApp)',    'Level meeting to discuss exam preparations and upcoming events. Link will be shared in the group.', '300L',         '2 hours before',   '00000000-0000-0000-0000-000000000102'),
  ('e0000000-0000-0000-0000-000000000003', 'Inter-Faculty Football Final','big_event',   '2026-06-22', '3:00 PM',  'Sports Complex',       'Computer Science vs. Physics department. Come out and support our team!',                           'All Students', '1 hour before',    '00000000-0000-0000-0000-000000000103');

-- Announcements
INSERT INTO announcements (id, title, body, posted_by_id, posted_by_display, category, target_audience)
VALUES
  ('an000000-0000-0000-0000-000000000001', 'Semester Examinations',       'First semester examinations begin Monday, July 14th, 2026. Timetables will be published by July 1st.',                          '00000000-0000-0000-0000-000000000103', 'James Adeleke (Dept. Executive)', 'Academic',        'All Students'),
  ('an000000-0000-0000-0000-000000000002', 'Course Registration Deadline','The student portal closes for course registration on June 25th, 2026. Register all courses before this date.',                '00000000-0000-0000-0000-000000000101', 'Yusuf Ibrahim (Lecturer)',        'Administrative',  'All Students'),
  ('an000000-0000-0000-0000-000000000003', 'New CSC309 Lecture Materials','Updated lecture notes for Computer Networks (CSC309) have been uploaded to the department portal.',                            '00000000-0000-0000-0000-000000000102', 'Sandra Okafor (Course Rep)',      'Academic',        '300L');

-- Audit Logs
INSERT INTO audit_logs (id, action, user_id, user_display, role, details, created_at)
VALUES
  ('lg000000-0000-0000-0000-000000000001', 'Login',                 '00000000-0000-0000-0000-000000000001', 'Adeyemi Tolu',  'Student',          'Logged in from iOS device',                     '2026-06-20 14:00:00+00'),
  ('lg000000-0000-0000-0000-000000000002', 'Attendance Marked',     '00000000-0000-0000-0000-000000000001', 'Adeyemi Tolu',  'Student',          'CSC309 — marked present via QR scan',           '2026-06-20 14:07:00+00'),
  ('lg000000-0000-0000-0000-000000000003', 'Account Approved',      '00000000-0000-0000-0000-000000000101', 'Ibrahim Yusuf', 'Lecturer',         'Approved: Nwosu Peter (ART2500004)',             '2026-06-20 11:30:00+00'),
  ('lg000000-0000-0000-0000-000000000004', 'Login',                 '00000000-0000-0000-0000-000000000101', 'Ibrahim Yusuf', 'Admin',            'Logged in from Android device',                 '2026-06-20 09:00:00+00'),
  ('lg000000-0000-0000-0000-000000000005', 'Class Session Created', '00000000-0000-0000-0000-000000000101', 'Ibrahim Yusuf', 'Admin',            'CSC301 Data Structures — 8:00 AM, LT1',         '2026-06-20 08:55:00+00'),
  ('lg000000-0000-0000-0000-000000000006', 'Payment Confirmed',     '00000000-0000-0000-0000-000000000101', 'Ibrahim Yusuf', 'Admin',            '₦5,000 from Adeyemi Tolu — Class Dues',         '2026-06-13 10:00:00+00'),
  ('lg000000-0000-0000-0000-000000000007', 'Account Created',       '00000000-0000-0000-0000-000000000102', 'Okafor Sandra', 'Course Rep',       'New student: Emmanuel Obi (ART2500006)',         '2026-06-18 09:00:00+00'),
  ('lg000000-0000-0000-0000-000000000008', 'Event Created',         '00000000-0000-0000-0000-000000000103', 'Adeleke James', 'Dept. Executive',  'Departmental Week — June 27, 2026',             '2026-06-17 15:00:00+00');


-- =============================================================================
-- DONE
-- Next steps:
--   1. Create auth users in Supabase dashboard (or via Auth API) for each demo
--      account — use the same UUIDs as the profiles above, or let the trigger
--      create the profiles automatically and then backfill the extra columns.
--   2. Set ANON_KEY and SERVICE_ROLE_KEY in your app environment.
--   3. Replace seedData.ts data arrays with supabase.from('...').select() calls.
--   4. Delete the SEED DATA section above before going to production.
-- =============================================================================
