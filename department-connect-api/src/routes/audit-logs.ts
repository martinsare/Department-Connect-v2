import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { mapAuditLog } from '../mappers.js';

const router = Router();

// GET /api/audit-logs  (developer only)
router.get('/', requireAuth, requireRole('developer'), async (_req, res) => {
  const { data, error } = await supabase
    .from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data?.map(mapAuditLog));
});

export default router;
