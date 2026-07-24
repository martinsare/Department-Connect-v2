import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications  (student: own + broadcasts; admin/dev: all admin notifs)
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  if (req.user!.role === 'student') {
    // Fetch own profile for level
    const { data: profile } = await supabase.from('profiles').select('level').eq('id', req.user!.id).single();
    const level = profile?.level ?? 'All';

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`student_id.eq.${req.user!.id},and(student_id.is.null,target_level.in.(${level},All Students))`)
      .order('created_at', { ascending: false });

    if (error) { res.status(500).json({ error: error.message }); return; }
    return res.json(data);
  }

  // Admin / developer: return admin_notifications
  const { data, error } = await supabase
    .from('admin_notifications')
    .select('*')
    .or(`admin_id.eq.${req.user!.id},admin_id.is.null`)
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res) => {
  const table = req.user!.role === 'student' ? 'notifications' : 'admin_notifications';
  const { data, error } = await supabase.from(table).update({ is_read: true }).eq('id', req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json(data);
});

// DELETE /api/notifications/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { error } = await supabase.from('notifications').delete().eq('id', req.params.id);
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ ok: true });
});

export default router;
