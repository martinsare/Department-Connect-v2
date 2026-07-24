import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';
import { mapContribution } from '../mappers.js';

const router = Router();

// GET /api/contributions
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { level } = req.query as Record<string, string>;
  let query = supabase.from('contributions').select('*').order('created_at', { ascending: false });
  if (level) query = query.eq('level', level);
  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data?.map(mapContribution));
});

// POST /api/contributions
router.post('/', requireAuth, requireRole('admin', 'developer'), async (req: AuthRequest, res) => {
  const { data, error } = await supabase
    .from('contributions')
    .insert({ ...req.body, status: 'unpaid' })
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }

  await supabase.from('notifications').insert({
    student_id: null,
    target_level: data.level,
    category: 'extras',
    title: `New Contribution: ${data.title}`,
    body: `₦${Number(data.amount).toLocaleString()} is due by ${data.deadline}. ${data.description ?? ''}`,
    priority: 'high',
  });

  res.status(201).json(mapContribution(data));
});

// POST /api/contributions/:id/submit-payment  (student claims payment)
router.post('/:id/submit-payment', requireAuth, requireRole('student'), async (req: AuthRequest, res) => {
  const { name, matric_number, level } = req.body;

  const { data: contrib } = await supabase.from('contributions').select('*').eq('id', req.params.id).single();
  if (!contrib) { res.status(404).json({ error: 'Contribution not found' }); return; }
  if (contrib.status !== 'unpaid') { res.status(400).json({ error: 'Payment already submitted or confirmed' }); return; }

  const { data, error } = await supabase.from('contributions')
    .update({
      status: 'pending',
      submitted_by_id: req.user!.id,
      submitted_by_name: name,
      submitted_by_matric: matric_number,
      submitted_by_level: level,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }

  await supabase.from('notifications').insert({
    student_id: req.user!.id,
    category: 'extras',
    title: 'Payment Pending Confirmation',
    body: `Your transfer for "${contrib.title}" (₦${Number(contrib.amount).toLocaleString()}) is awaiting Admin confirmation.`,
    priority: 'normal',
  });

  await supabase.from('admin_notifications').insert({
    admin_id: null,
    icon: 'card-outline',
    icon_color: '#F59E0B',
    title: 'New Payment Claim',
    body: `${name} (${matric_number}) claims to have paid ₦${Number(contrib.amount).toLocaleString()} for "${contrib.title}".`,
    priority: 'high',
  });

  res.json(mapContribution(data));
});

// PATCH /api/contributions/:id/verify  (admin confirms or rejects)
router.patch('/:id/verify', requireAuth, requireRole('admin', 'developer'), async (req: AuthRequest, res) => {
  const { action, rejection_reason } = req.body as { action: 'confirm' | 'reject'; rejection_reason?: string };

  const { data: contrib } = await supabase.from('contributions').select('*').eq('id', req.params.id).single();
  if (!contrib) { res.status(404).json({ error: 'Contribution not found' }); return; }

  const updates: Record<string, any> =
    action === 'confirm'
      ? { status: 'confirmed', paid_date: new Date().toISOString().split('T')[0], rejection_reason: null }
      : { status: 'rejected', rejection_reason };

  const { data, error } = await supabase.from('contributions').update(updates).eq('id', req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }

  if (contrib.submitted_by_id) {
    const msg = action === 'confirm'
      ? `Your payment of ₦${Number(contrib.amount).toLocaleString()} for "${contrib.title}" has been confirmed.`
      : `Your payment for "${contrib.title}" was rejected${rejection_reason ? `: ${rejection_reason}` : '.'} Please contact Admin.`;

    await supabase.from('notifications').insert({
      student_id: contrib.submitted_by_id,
      category: 'extras',
      title: action === 'confirm' ? 'Payment Confirmed ✓' : 'Payment Rejected',
      body: msg,
      priority: 'high',
    });
  }

  res.json(mapContribution(data));
});

export default router;
