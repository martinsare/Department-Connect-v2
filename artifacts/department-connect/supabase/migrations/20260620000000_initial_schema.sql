-- =============================================================================
-- Department Connect — Initial Schema
-- Migration: 20260620000000_initial_schema
-- =============================================================================


-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role           AS ENUM ('student', 'admin', 'developer');
CREATE TYPE admin_sub_role      AS ENUM ('Lecturer', 'Course Representative', 'Department Executive');
CREATE TYPE account_status      AS ENUM ('active', 'pending', 'rejected', 'suspended');
CREATE TYPE class_status        AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE notif_category      AS ENUM ('lectures', 'big_events', 'small_events', 'extras');
CREATE TYPE notif_priority      AS ENUM ('high', 'normal');
CREATE TYPE contribution_status AS ENUM ('unpaid', 'pending', 'confirmed', 'rejected');
CREATE TYPE event_category      AS ENUM ('lecture', 'big_event', 'small_event', 'extra');


-- =============================================================================
-- SHARED TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;


-- =============================================================================
-- PROFILES
-- One row per user — extends Supabase auth.users.
-- Students  → matric_number + level filled, staff_id NULL
-- Admins    → staff_id + sub_role filled, matric_number NULL
-- Developer → staff_id filled, sub_role NULL
-- =============================================================================

CREATE TABLE profiles (
  id               UUID           PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name       TEXT           NOT NULL,
  surname          TEXT           NOT NULL,
  role             user_role      NOT NULL,
  sub_role         admin_sub_role,
  matric_number    TEXT           UNIQUE,
  staff_id         TEXT           UNIQUE,
  level            TEXT,
  department       TEXT           NOT NULL DEFAULT '',
  phone            TEXT,
  email            TEXT,
  dob              DATE,
  status           account_status NOT NULL DEFAULT 'pending',
  birthday_privacy BOOLEAN        NOT NULL DEFAULT FALSE,
  hide_year        BOOLEAN        NOT NULL DEFAULT FALSE,
  profile_picture  TEXT,
  rejection_reason TEXT,
  submitted_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role       ON profiles (role);
CREATE INDEX idx_profiles_status     ON profiles (status);
CREATE INDEX idx_profiles_level      ON profiles (level);
CREATE INDEX idx_profiles_department ON profiles (department);
CREATE INDEX idx_profiles_matric     ON profiles (matric_number);

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();


-- =============================================================================
-- CLASSES
-- One row per scheduled lecture / lab session.
-- =============================================================================

CREATE TABLE classes (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code      TEXT         NOT NULL,
  course_name      TEXT         NOT NULL,
  lecturer_id      UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  date             DATE         NOT NULL,
  start_time       TEXT         NOT NULL,
  end_time         TEXT         NOT NULL,
  venue            TEXT         NOT NULL,
  status           class_status NOT NULL DEFAULT 'upcoming',
  attendance_open  BOOLEAN      NOT NULL DEFAULT FALSE,
  attendance_count INT          NOT NULL DEFAULT 0,
  level            TEXT         NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classes_date     ON classes (date);
CREATE INDEX idx_classes_level    ON classes (level);
CREATE INDEX idx_classes_status   ON classes (status);
CREATE INDEX idx_classes_lecturer ON classes (lecturer_id);


-- =============================================================================
-- CLASS ATTENDEES
-- One row per student who QR-scanned into a class. Unique per student+class.
-- =============================================================================

CREATE TABLE class_attendees (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID        NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  matric_number TEXT        NOT NULL,
  level         TEXT        NOT NULL,
  scan_time     TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_id, student_id)
);

CREATE INDEX idx_class_attendees_class   ON class_attendees (class_id);
CREATE INDEX idx_class_attendees_student ON class_attendees (student_id);


-- =============================================================================
-- ATTENDANCE SUMMARY
-- Per-student, per-semester, per-course totals.
-- percentage is auto-calculated via a generated column.
-- =============================================================================

CREATE TABLE attendance_summary (
  id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID     NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  semester    SMALLINT NOT NULL CHECK (semester IN (1, 2)),
  course_code TEXT     NOT NULL,
  course_name TEXT     NOT NULL,
  attended    INT      NOT NULL DEFAULT 0 CHECK (attended >= 0),
  total       INT      NOT NULL DEFAULT 0 CHECK (total >= 0),
  percentage  NUMERIC(5, 2) GENERATED ALWAYS AS (
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
-- student_id IS NULL → broadcast to all students (optionally scoped by target_level).
-- =============================================================================

CREATE TABLE notifications (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID           REFERENCES profiles(id) ON DELETE CASCADE,
  target_level TEXT,
  category     notif_category NOT NULL,
  title        TEXT           NOT NULL,
  body         TEXT           NOT NULL,
  priority     notif_priority NOT NULL DEFAULT 'normal',
  is_read      BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_student    ON notifications (student_id);
CREATE INDEX idx_notifications_is_read    ON notifications (is_read);
CREATE INDEX idx_notifications_category   ON notifications (category);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);


-- =============================================================================
-- ADMIN NOTIFICATIONS  (admin/developer-facing)
-- admin_id IS NULL → broadcast to all admins.
-- =============================================================================

CREATE TABLE admin_notifications (
  id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   UUID           REFERENCES profiles(id) ON DELETE CASCADE,
  icon       TEXT           NOT NULL,
  icon_color TEXT           NOT NULL,
  title      TEXT           NOT NULL,
  body       TEXT           NOT NULL,
  priority   notif_priority NOT NULL DEFAULT 'normal',
  is_read    BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_notifs_admin      ON admin_notifications (admin_id);
CREATE INDEX idx_admin_notifs_is_read    ON admin_notifications (is_read);
CREATE INDEX idx_admin_notifs_created_at ON admin_notifications (created_at DESC);


-- =============================================================================
-- CONTRIBUTIONS  (payment dues)
-- submitted_by_* columns are a snapshot taken when a student taps "I Have Paid".
-- =============================================================================

CREATE TABLE contributions (
  id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT                NOT NULL,
  amount              NUMERIC(10, 2)      NOT NULL CHECK (amount > 0),
  status              contribution_status NOT NULL DEFAULT 'unpaid',
  deadline            DATE                NOT NULL,
  paid_date           DATE,
  level               TEXT                NOT NULL,
  description         TEXT,
  bank_name           TEXT                NOT NULL,
  account_number      TEXT                NOT NULL,
  account_name        TEXT                NOT NULL,
  rejection_reason    TEXT,
  submitted_by_id     UUID                REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_by_name   TEXT,
  submitted_by_matric TEXT,
  submitted_by_level  TEXT,
  submitted_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contributions_status ON contributions (status);
CREATE INDEX idx_contributions_level  ON contributions (level);

CREATE TRIGGER trg_contributions_updated
  BEFORE UPDATE ON contributions
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();


-- =============================================================================
-- EVENTS
-- =============================================================================

CREATE TABLE events (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT           NOT NULL,
  category          event_category NOT NULL,
  date              DATE           NOT NULL,
  time              TEXT           NOT NULL,
  venue             TEXT           NOT NULL,
  description       TEXT           NOT NULL,
  target_audience   TEXT,
  reminder_schedule TEXT,
  created_by        UUID           REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_date     ON events (date);
CREATE INDEX idx_events_audience ON events (target_audience);
CREATE INDEX idx_events_category ON events (category);


-- =============================================================================
-- ANNOUNCEMENTS
-- =============================================================================

CREATE TABLE announcements (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT        NOT NULL,
  body              TEXT        NOT NULL,
  posted_by_id      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  posted_by_display TEXT        NOT NULL,
  category          TEXT        NOT NULL,
  target_audience   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_target   ON announcements (target_audience);
CREATE INDEX idx_announcements_category ON announcements (category);
CREATE INDEX idx_announcements_created  ON announcements (created_at DESC);


-- =============================================================================
-- AUDIT LOGS
-- Append-only activity trail — never UPDATE or DELETE rows here.
-- =============================================================================

CREATE TABLE audit_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action       TEXT        NOT NULL,
  user_id      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  user_display TEXT        NOT NULL,
  role         TEXT        NOT NULL,
  details      TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user       ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_attendees     ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_summary  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;

-- Helper: current user's role (cached per statement)
CREATE OR REPLACE FUNCTION my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role::TEXT FROM profiles WHERE id = auth.uid();
$$;

-- ── profiles ──
CREATE POLICY "profiles: read all"         ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles: insert own"       ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles: update own"       ON profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles: admin update any" ON profiles FOR UPDATE TO authenticated USING (my_role() IN ('admin', 'developer'));

-- ── classes ──
CREATE POLICY "classes: read all"    ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "classes: admin write" ON classes FOR ALL    TO authenticated USING (my_role() IN ('admin', 'developer'));

-- ── class_attendees ──
CREATE POLICY "attendees: admin read all"    ON class_attendees FOR SELECT TO authenticated USING (my_role() IN ('admin', 'developer'));
CREATE POLICY "attendees: student read own"  ON class_attendees FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "attendees: student insert"    ON class_attendees FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

-- ── attendance_summary ──
CREATE POLICY "att_summary: student read own" ON attendance_summary FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "att_summary: admin read all"   ON attendance_summary FOR SELECT TO authenticated USING (my_role() IN ('admin', 'developer'));
CREATE POLICY "att_summary: admin write"      ON attendance_summary FOR ALL    TO authenticated USING (my_role() IN ('admin', 'developer'));

-- ── notifications ──
CREATE POLICY "notifs: student read"       ON notifications FOR SELECT TO authenticated USING (my_role() = 'student' AND (student_id = auth.uid() OR student_id IS NULL));
CREATE POLICY "notifs: student mark read"  ON notifications FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "notifs: admin write"        ON notifications FOR ALL    TO authenticated USING (my_role() IN ('admin', 'developer'));

-- ── admin_notifications ──
CREATE POLICY "admin_notifs: read own"  ON admin_notifications FOR SELECT TO authenticated USING (my_role() IN ('admin', 'developer') AND (admin_id = auth.uid() OR admin_id IS NULL));
CREATE POLICY "admin_notifs: mark read" ON admin_notifications FOR UPDATE TO authenticated USING (admin_id = auth.uid());
CREATE POLICY "admin_notifs: insert"    ON admin_notifications FOR INSERT TO authenticated WITH CHECK (my_role() IN ('admin', 'developer'));

-- ── contributions ──
CREATE POLICY "contrib: read all"         ON contributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "contrib: admin insert"     ON contributions FOR INSERT TO authenticated WITH CHECK (my_role() IN ('admin', 'developer'));
CREATE POLICY "contrib: student submit"   ON contributions FOR UPDATE TO authenticated USING (my_role() = 'student' AND status = 'unpaid') WITH CHECK (my_role() = 'student');
CREATE POLICY "contrib: admin update"     ON contributions FOR UPDATE TO authenticated USING (my_role() IN ('admin', 'developer'));

-- ── events ──
CREATE POLICY "events: read all"    ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events: admin write" ON events FOR ALL    TO authenticated USING (my_role() IN ('admin', 'developer'));

-- ── announcements ──
CREATE POLICY "announcements: read all"    ON announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "announcements: admin write" ON announcements FOR ALL    TO authenticated USING (my_role() IN ('admin', 'developer'));

-- ── audit_logs ──
CREATE POLICY "audit_logs: developer read" ON audit_logs FOR SELECT TO authenticated USING (my_role() = 'developer');
CREATE POLICY "audit_logs: insert"         ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);


-- =============================================================================
-- TRIGGER: auto-create profile when a new auth user signs up
-- Reads metadata passed during signUp({ data: { first_name, surname, role, department } })
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
