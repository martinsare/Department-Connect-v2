import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { mapNotification } from '../mappers.js';

const router = Router();

// GET /api/notifications  — returns notifications for the logged-in user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;

  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (user.role === 'student') {
    // Student sees notifications addressed to them or broadcast to their level
    query = query.or(`student_id.eq.${user.id},student_id.is.null`);
  }
  // Admins/devs see all notifications

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data?.map(mapNotification));
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (_req, res) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', _req.params.id);

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ ok: true });
});

export default router;
