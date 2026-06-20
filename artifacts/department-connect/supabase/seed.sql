-- =============================================================================
-- Department Connect — Seed Data
-- Run AFTER the initial migration.
-- DELETE this file's contents before going to production.
--
-- NOTE: These profiles reference auth.users rows.
-- Create the auth users first (Supabase Dashboard → Authentication → Users)
-- using these exact UUIDs, then run this seed.
-- Password for all demo accounts: "password"
-- =============================================================================


-- ── Students ──────────────────────────────────────────────────────────────────

INSERT INTO profiles (id, first_name, surname, role, matric_number, level, department, phone, email, dob, status, birthday_privacy, hide_year)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Tolu',     'Adeyemi',  'student', 'ART2500001', '300L', 'Computer Science', '08012345678', 'tolu.adeyemi@example.com', '1998-03-15', 'active',   true,  true),
  ('00000000-0000-0000-0000-000000000002', 'Chidi',    'Okonkwo',  'student', 'ART2500002', '300L', 'Computer Science', '08023456789', 'chidi@example.com',         '1998-07-22', 'active',   false, false),
  ('00000000-0000-0000-0000-000000000003', 'Fatima',   'Bello',    'student', 'ART2500003', '200L', 'Computer Science', '08034567890', '',                          '2000-11-05', 'pending',  false, false),
  ('00000000-0000-0000-0000-000000000004', 'Peter',    'Nwosu',    'student', 'ART2500004', '400L', 'Computer Science', '08045678901', 'peter@example.com',         '1997-05-18', 'active',   true,  false),
  ('00000000-0000-0000-0000-000000000005', 'Kemi',     'Adesanya', 'student', 'ART2500005', '100L', 'Computer Science', '08056789012', '',                          '2002-01-30', 'rejected', false, false),
  ('00000000-0000-0000-0000-000000000006', 'Emmanuel', 'Obi',      'student', 'ART2500006', '300L', 'Computer Science', '08067890123', '',                          '1998-09-12', 'pending',  false, false),
  ('00000000-0000-0000-0000-000000000007', 'Rukayat',  'Lawal',    'student', 'ART2500007', '200L', 'Computer Science', '08078901234', 'rukayat@example.com',       '2000-04-25', 'active',   true,  true),
  ('00000000-0000-0000-0000-000000000008', 'Michael',  'Eze',      'student', 'ART2500008', '400L', 'Computer Science', '08089012345', 'michael@example.com',       '1997-12-03', 'active',   true,  false);

UPDATE profiles SET rejection_reason = 'Invalid matric number format provided. Please resubmit.'
  WHERE id = '00000000-0000-0000-0000-000000000005';
UPDATE profiles SET submitted_at = '2026-06-18 00:00:00+00' WHERE id = '00000000-0000-0000-0000-000000000003';
UPDATE profiles SET submitted_at = '2026-06-17 00:00:00+00' WHERE id = '00000000-0000-0000-0000-000000000006';


-- ── Admins ────────────────────────────────────────────────────────────────────

INSERT INTO profiles (id, first_name, surname, role, sub_role, staff_id, level, department, phone, email, status)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'Yusuf',  'Ibrahim', 'admin', 'Lecturer',              'LEC001', NULL,  'Computer Science', '08011223344', 'yusuf.ibrahim@csc.edu', 'active'),
  ('00000000-0000-0000-0000-000000000102', 'Sandra', 'Okafor',  'admin', 'Course Representative', 'REP001', '300L','Computer Science', '08022334455', 'sandra.okafor@csc.edu', 'active'),
  ('00000000-0000-0000-0000-000000000103', 'James',  'Adeleke', 'admin', 'Department Executive',  'EXE001', NULL,  'Computer Science', '08033445566', 'james.adeleke@csc.edu', 'active');


-- ── Developer ─────────────────────────────────────────────────────────────────

INSERT INTO profiles (id, first_name, surname, role, staff_id, department, phone, email, status)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'Dev', 'Martins', 'developer', 'DEV001', 'System', '08099887766', 'dev@departmentconnect.ng', 'active');


-- ── Classes ───────────────────────────────────────────────────────────────────

INSERT INTO classes (id, course_code, course_name, lecturer_id, date, start_time, end_time, venue, status, attendance_open, attendance_count, level)
VALUES
  ('cl000000-0000-0000-0000-000000000001', 'CSC301', 'Data Structures',       '00000000-0000-0000-0000-000000000101', '2026-06-20', '8:00 AM',  '10:00 AM', 'LT1', 'completed', false, 18, '300L'),
  ('cl000000-0000-0000-0000-000000000002', 'CSC305', 'Software Engineering',  '00000000-0000-0000-0000-000000000101', '2026-06-20', '10:00 AM', '12:00 PM', 'LT2', 'completed', false, 21, '300L'),
  ('cl000000-0000-0000-0000-000000000003', 'CSC309', 'Computer Networks',     '00000000-0000-0000-0000-000000000102', '2026-06-20', '2:00 PM',  '4:00 PM',  'LT1', 'ongoing',   true,  14, '300L'),
  ('cl000000-0000-0000-0000-000000000004', 'CSC311', 'Database Systems',      '00000000-0000-0000-0000-000000000101', '2026-06-19', '8:00 AM',  '10:00 AM', 'LT3', 'completed', false, 20, '300L'),
  ('cl000000-0000-0000-0000-000000000005', 'CSC313', 'Computer Architecture', '00000000-0000-0000-0000-000000000102', '2026-06-19', '12:00 PM', '2:00 PM',  'LT2', 'completed', false, 17, '300L');


-- ── Attendance Summary (Tolu — both semesters) ────────────────────────────────

INSERT INTO attendance_summary (student_id, semester, course_code, course_name, attended, total)
VALUES
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC301', 'Data Structures',        18, 20),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC303', 'Software Engineering',   14, 18),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC305', 'Computer Networks',      12, 15),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC307', 'Database Systems',       16, 20),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC309', 'Computer Architecture',  9,  12),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC311', 'Discrete Mathematics',   11, 16),
  ('00000000-0000-0000-0000-000000000001', 1, 'GST301', 'Entrepreneurship',       15, 18),
  ('00000000-0000-0000-0000-000000000001', 1, 'CSC313', 'Systems Programming',    8,  14),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC302', 'Theory of Computation',  16, 19),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC304', 'Operating Systems',      13, 18),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC306', 'Compiler Design',        10, 16),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC308', 'Artificial Intelligence',17, 20),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC310', 'Computer Graphics',      14, 17),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC312', 'Information Systems',    11, 18),
  ('00000000-0000-0000-0000-000000000001', 2, 'GST302', 'Technical Writing',      16, 18),
  ('00000000-0000-0000-0000-000000000001', 2, 'CSC314', 'Numerical Analysis',     9,  15);


-- ── Contributions ─────────────────────────────────────────────────────────────

INSERT INTO contributions (id, title, amount, status, deadline, paid_date, level, description, bank_name, account_number, account_name, submitted_by_id, submitted_by_name, submitted_by_matric, submitted_by_level, submitted_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Class Dues — 1st Semester', 5000, 'confirmed', '2026-01-31', '2026-01-20', '300L', 'Mandatory semester dues covering departmental expenses and student welfare.',             'First Bank',  '3012345678', 'CS Dept Student Fund',   NULL,                                   NULL,            NULL,         NULL,   NULL),
  ('c0000000-0000-0000-0000-000000000002', 'Departmental Week Fund',    3000, 'unpaid',    '2026-07-01', NULL,         '300L', 'Contribution towards the annual departmental week celebration, events, and logistics.',  'GTBank',      '0123456789', 'CS Dept Events Fund',    NULL,                                   NULL,            NULL,         NULL,   NULL),
  ('c0000000-0000-0000-0000-000000000003', 'Course Materials Fund',     2500, 'pending',   '2026-02-28', NULL,         '300L', 'Funds for printing course materials, lab supplies, and shared academic resources.',      'Access Bank', '0987654321', 'CS Dept Materials Fund', '00000000-0000-0000-0000-000000000001', 'Tolu Adeyemi', 'ART2500001', '300L', '2026-06-20 08:30:00+00'),
  ('c0000000-0000-0000-0000-000000000004', 'Exam Clearance Fee',        1500, 'unpaid',    '2026-06-28', NULL,         '300L', 'Required fee for examination clearance. Must be paid before exam period begins.',         'Zenith Bank', '2109876543', 'CS Dept Admin Fund',     NULL,                                   NULL,            NULL,         NULL,   NULL);


-- ── Events ────────────────────────────────────────────────────────────────────

INSERT INTO events (id, title, category, date, time, venue, description, target_audience, reminder_schedule, created_by)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Departmental Week',           'big_event',   '2026-06-27', '9:00 AM', 'Faculty Building',  'Annual departmental week celebration with games, talks, and exhibitions. All students must attend.', 'All Students', 'Both',           '00000000-0000-0000-0000-000000000103'),
  ('e0000000-0000-0000-0000-000000000002', '300L WhatsApp Meeting',       'small_event', '2026-06-21', '3:00 PM', 'Online (WhatsApp)', 'Level meeting to discuss exam preparations and upcoming events. Link will be shared in the group.', '300L',         '2 hours before', '00000000-0000-0000-0000-000000000102'),
  ('e0000000-0000-0000-0000-000000000003', 'Inter-Faculty Football Final','big_event',   '2026-06-22', '3:00 PM', 'Sports Complex',    'Computer Science vs. Physics department. Come out and support our team!',                          'All Students', '1 hour before',  '00000000-0000-0000-0000-000000000103');


-- ── Announcements ─────────────────────────────────────────────────────────────

INSERT INTO announcements (id, title, body, posted_by_id, posted_by_display, category, target_audience)
VALUES
  ('an000000-0000-0000-0000-000000000001', 'Semester Examinations',        'First semester examinations begin Monday, July 14th, 2026. Timetables will be published by July 1st.',                         '00000000-0000-0000-0000-000000000103', 'James Adeleke (Dept. Executive)', 'Academic',       'All Students'),
  ('an000000-0000-0000-0000-000000000002', 'Course Registration Deadline', 'The student portal closes for course registration on June 25th, 2026. Register all courses before this date.',               '00000000-0000-0000-0000-000000000101', 'Yusuf Ibrahim (Lecturer)',        'Administrative', 'All Students'),
  ('an000000-0000-0000-0000-000000000003', 'New CSC309 Lecture Materials', 'Updated lecture notes for Computer Networks (CSC309) have been uploaded to the department portal.',                           '00000000-0000-0000-0000-000000000102', 'Sandra Okafor (Course Rep)',      'Academic',       '300L');


-- ── Audit Logs ────────────────────────────────────────────────────────────────

INSERT INTO audit_logs (id, action, user_id, user_display, role, details, created_at)
VALUES
  ('lg000000-0000-0000-0000-000000000001', 'Login',                 '00000000-0000-0000-0000-000000000001', 'Adeyemi Tolu',  'Student',         'Logged in from iOS device',               '2026-06-20 14:00:00+00'),
  ('lg000000-0000-0000-0000-000000000002', 'Attendance Marked',     '00000000-0000-0000-0000-000000000001', 'Adeyemi Tolu',  'Student',         'CSC309 — marked present via QR scan',    '2026-06-20 14:07:00+00'),
  ('lg000000-0000-0000-0000-000000000003', 'Account Approved',      '00000000-0000-0000-0000-000000000101', 'Ibrahim Yusuf', 'Lecturer',        'Approved: Nwosu Peter (ART2500004)',      '2026-06-20 11:30:00+00'),
  ('lg000000-0000-0000-0000-000000000004', 'Login',                 '00000000-0000-0000-0000-000000000101', 'Ibrahim Yusuf', 'Admin',           'Logged in from Android device',           '2026-06-20 09:00:00+00'),
  ('lg000000-0000-0000-0000-000000000005', 'Class Session Created', '00000000-0000-0000-0000-000000000101', 'Ibrahim Yusuf', 'Admin',           'CSC301 Data Structures — 8:00 AM, LT1',  '2026-06-20 08:55:00+00'),
  ('lg000000-0000-0000-0000-000000000006', 'Payment Confirmed',     '00000000-0000-0000-0000-000000000101', 'Ibrahim Yusuf', 'Admin',           '₦5,000 from Adeyemi Tolu — Class Dues',  '2026-06-13 10:00:00+00'),
  ('lg000000-0000-0000-0000-000000000007', 'Account Created',       '00000000-0000-0000-0000-000000000102', 'Okafor Sandra', 'Course Rep',      'New student: Emmanuel Obi (ART2500006)', '2026-06-18 09:00:00+00'),
  ('lg000000-0000-0000-0000-000000000008', 'Event Created',         '00000000-0000-0000-0000-000000000103', 'Adeleke James', 'Dept. Executive', 'Departmental Week — June 27, 2026',      '2026-06-17 15:00:00+00');
