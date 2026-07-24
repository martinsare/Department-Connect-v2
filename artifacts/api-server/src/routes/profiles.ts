import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/profiles  — admin/dev: all; student: their own only
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { role, status, level } = req.query as Record<string, string>;

  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

  if (req.user!.role === 'student') {
    // Students can only see their own profile
    query = query.eq('id', req.user!.id);
  } else {
    if (role) query = query.eq('role', role);
    if (status) query = query.eq('status', status);
    if (level) query = query.eq('level', level);
  }

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// GET /api/profiles/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  // Students can only view their own profile
  if (req.user!.role === 'student' && req.params.id !== req.user!.id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', req.params.id).single();
  if (error || !data) { res.status(404).json({ error: 'Profile not found' }); return; }
  res.json(data);
});

// PATCH /api/profiles/:id  — approve/reject/update (admin/dev only, or self)
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const isSelf = req.params.id === req.user!.id;
  const isAdminOrDev = ['admin', 'developer'].includes(req.user!.role);

  if (!isSelf && !isAdminOrDev) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const { data: before } = await supabase.from('profiles').select('*').eq('id', req.params.id).single();
  const { data, error } = await supabase
    .from('profiles')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) { res.status(400).json({ error: error?.message ?? 'Update failed' }); return; }

  // Audit log for status changes
  if (before && req.body.status && before.status !== req.body.status) {
    const action = req.body.status === 'active' ? 'Account Approved' : 'Account Rejected';
    await supabase.from('audit_logs').insert({
      action,
      user_id: req.user!.id,
      user_display: `${data.surname} ${data.first_name}`,
      role: req.user!.role,
      details: `${action}: ${before.first_name} ${before.surname}${req.body.rejection_reason ? ` — ${req.body.rejection_reason}` : ''}`,
    });

    // Notify the student
    if (req.body.status === 'active') {
      await supabase.from('notifications').insert({
        student_id: data.id,
        category: 'extras',
        title: 'Account Approved ✓',
        body: 'Your account has been approved. Welcome to Department Connect!',
        priority: 'high',
      });
    } else if (req.body.status === 'rejected') {
      await supabase.from('notifications').insert({
        student_id: data.id,
        category: 'extras',
        title: 'Account Rejected',
        body: `Your account was rejected: ${req.body.rejection_reason ?? 'Please contact Admin.'}`,
        priority: 'high',
      });
    }
  }

  res.json(data);
});

// GET /api/profiles/:id/attendance?semester=1|2
router.get('/:id/attendance', requireAuth, async (req: AuthRequest, res) => {
  const targetId = req.params.id;
  const isSelf = targetId === req.user!.id;
  const isAdminOrDev = ['admin', 'developer'].includes(req.user!.role);

  if (!isSelf && !isAdminOrDev) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  let query = supabase
    .from('attendance_summary')
    .select('*')
    .eq('student_id', targetId)
    .order('course_code');

  if (req.query.semester) {
    query = query.eq('semester', Number(req.query.semester));
  }

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

export default router;
