import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/announcements
router.get('/', requireAuth, async (_req, res) => {
  const { data, error } = await supabase
    .from('announcements').select('*').order('created_at', { ascending: false });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// POST /api/announcements  (admin/dev only)
router.post('/', requireAuth, requireRole('admin', 'developer'), async (req: AuthRequest, res) => {
  const { data: poster } = await supabase.from('profiles').select('first_name,surname,sub_role,role').eq('id', req.user!.id).single();
  const displayName = poster
    ? `${poster.first_name} ${poster.surname} (${poster.sub_role ?? poster.role})`
    : req.user!.id;

  const { data, error } = await supabase.from('announcements').insert({
    ...req.body,
    posted_by_id: req.user!.id,
    posted_by_display: displayName,
  }).select().single();

  if (error) { res.status(400).json({ error: error.message }); return; }

  // Create notification for target audience
  await supabase.from('notifications').insert({
    student_id: null,
    target_level: data.target_audience ?? 'All Students',
    category: 'extras',
    title: data.title,
    body: data.body,
    priority: data.category === 'Urgent' ? 'high' : 'normal',
  });

  res.status(201).json(data);
});

export default router;
