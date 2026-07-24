import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';
import { mapClass, mapClassAttendee } from '../mappers.js';

const router = Router();

// GET /api/classes
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { level, status } = req.query as Record<string, string>;

  let query = supabase.from('classes').select('*').order('date', { ascending: false });
  if (level) query = query.eq('level', level);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data?.map(mapClass));
});

// POST /api/classes
router.post('/', requireAuth, requireRole('admin', 'developer'), async (req: AuthRequest, res) => {
  const { data, error } = await supabase
    .from('classes')
    .insert({ ...req.body, lecturer_id: req.user!.id })
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }

  await supabase.from('audit_logs').insert({
    action: 'Class Session Created',
    user_id: req.user!.id,
    user_display: req.user!.id,
    role: req.user!.role,
    details: `${data.course_code} ${data.course_name} — ${data.date}, ${data.start_time}, ${data.venue}`,
  });

  await supabase.from('notifications').insert({
    student_id: null,
    target_level: data.level,
    category: 'lectures',
    title: `New Class: ${data.course_code}`,
    body: `${data.course_name} is scheduled for ${data.date} at ${data.start_time} in ${data.venue}.`,
    priority: 'normal',
  });

  res.status(201).json(mapClass(data));
});

// PATCH /api/classes/:id
router.patch('/:id', requireAuth, requireRole('admin', 'developer'), async (req: AuthRequest, res) => {
  const { data: before } = await supabase.from('classes').select('*').eq('id', req.params.id).single();
  const { data, error } = await supabase.from('classes').update(req.body).eq('id', req.params.id).select().single();

  if (error || !data) { res.status(400).json({ error: error?.message ?? 'Update failed' }); return; }

  if (before && req.body.attendance_open === true && !before.attendance_open) {
    await supabase.from('notifications').insert({
      student_id: null,
      target_level: data.level,
      category: 'lectures',
      title: 'Attendance Now Open',
      body: `${data.course_code} ${data.course_name} attendance window is now open. Scan the QR code to mark yourself present.`,
      priority: 'high',
    });
  }

  if (before && req.body.attendance_open === false && before.attendance_open) {
    await supabase.from('notifications').insert({
      student_id: null,
      target_level: data.level,
      category: 'lectures',
      title: 'Attendance Closed',
      body: `${data.course_code} ${data.course_name} attendance window has closed. ${data.attendance_count} students were marked present.`,
      priority: 'normal',
    });
  }

  res.json(mapClass(data));
});

// POST /api/classes/:id/attendance  (student marks attendance)
router.post('/:id/attendance', requireAuth, requireRole('student'), async (req: AuthRequest, res) => {
  const { data: cls, error: clsErr } = await supabase
    .from('classes').select('*').eq('id', req.params.id).single();

  if (clsErr || !cls) { res.status(404).json({ error: 'Class not found' }); return; }
  if (!cls.attendance_open) { res.status(400).json({ error: 'Attendance is not open for this class' }); return; }

  const { name, matric_number, level, scan_time } = req.body;

  const { data, error } = await supabase.from('class_attendees').insert({
    class_id: req.params.id,
    student_id: req.user!.id,
    name,
    matric_number,
    level,
    scan_time: scan_time ?? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }).select().single();

  if (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'You have already marked attendance for this class' });
    } else {
      res.status(400).json({ error: error.message });
    }
    return;
  }

  await supabase.from('classes').update({ attendance_count: cls.attendance_count + 1 }).eq('id', req.params.id);

  await supabase.from('audit_logs').insert({
    action: 'Attendance Marked',
    user_id: req.user!.id,
    user_display: name,
    role: 'student',
    details: `${cls.course_code} — marked present via QR scan`,
  });

  res.status(201).json(mapClassAttendee(data));
});

// GET /api/classes/:id/attendees
router.get('/:id/attendees', requireAuth, requireRole('admin', 'developer'), async (_req, res) => {
  const { data, error } = await supabase
    .from('class_attendees').select('*').eq('class_id', _req.params.id).order('created_at');

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data?.map(mapClassAttendee));
});

export default router;
