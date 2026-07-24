import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/events
router.get('/', requireAuth, async (_req, res) => {
  const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// POST /api/events  (admin/dev only)
router.post('/', requireAuth, requireRole('admin', 'developer'), async (req: AuthRequest, res) => {
  const { data, error } = await supabase
    .from('events')
    .insert({ ...req.body, created_by: req.user!.id })
    .select().single();

  if (error) { res.status(400).json({ error: error.message }); return; }

  await supabase.from('audit_logs').insert({
    action: 'Event Created',
    user_id: req.user!.id,
    user_display: req.user!.id,
    role: req.user!.role,
    details: `${data.title} — ${data.date}`,
  });

  // Notify students
  await supabase.from('notifications').insert({
    student_id: null,
    target_level: data.target_audience ?? 'All Students',
    category: data.category === 'big_event' ? 'big_events' : 'small_events',
    title: `Event: ${data.title}`,
    body: `${data.description} — ${data.date} at ${data.time}, ${data.venue}`,
    priority: data.category === 'big_event' ? 'high' : 'normal',
  });

  res.status(201).json(data);
});

export default router;
