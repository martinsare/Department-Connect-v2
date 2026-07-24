import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/contributions
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { level } = req.query as Record<string, string>;
  let query = supabase.from('contributions').select('*').order('created_at', { ascending: false });
  if (level) query = query.eq('level', level);
  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// POST /api/contributions  (admin/dev only)
router.post('/', requireAuth, requireRole('admin', 'developer'), async (req: AuthRequest, res) => {
  const { data, error } = await supabase.from('contributions').insert({ ...req.body, status: 'unpaid' }).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }

  await supabase.from('notifications').insert({
    student_id: null,
    target_level: data.level,
    category: 'extras',
    title: `New Contribution: ${data.title}`,
    body: `₦${Number(data.amount).toLocaleString()} is due by ${data.deadline}. ${data.description ?? ''}`,
    priority: 'high',
  });

  res.status(201).json(data);
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
    .select().single();

  if (error) { res.status(400).json({ error: error.message }); return; }

  // Notify student
  await supabase.from('notifications').insert({
    student_id: req.user!.id,
    category: 'extras',
    title: 'Payment Pending Confirmation',
    body: `Your transfer for "${contrib.title}" (₦${Number(contrib.amount).toLocaleString()}) is awaiting Admin confirmation.`,
    priority: 'normal',
  });

  // Notify all admins
  await supabase.from('admin_notifications').insert({
    admin_id: null,
    icon: 'card-outline',
    icon_color: '#F59E0B',
    title: 'New Payment Claim',
    body: `${name} (${matric_number}) claims to have paid ₦${Number(contrib.amount).toLocaleString()} for "${contrib.title}".`,
    priority: 'high',
  });

  res.json(data);
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

  const studentTitle = action === 'confirm' ? 'Payment Confirmed ✓' : 'Payment Rejected';
  const studentBody = action === 'confirm'
    ? `Your payment of ₦${Number(contrib.amount).toLocaleString()} for "${contrib.title}" has been confirmed by Admin. Thank you!`
    : `Your payment for "${contrib.title}" was rejected: ${rejection_reason}. Please transfer the correct amount and try again.`;

  if (contrib.submitted_by_id) {
    await supabase.from('notifications').insert({
      student_id: contrib.submitted_by_id,
      category: 'extras',
      title: studentTitle,
      body: studentBody,
      priority: action === 'confirm' ? 'normal' : 'high',
    });
  }

  await supabase.from('admin_notifications').insert({
    admin_id: null,
    icon: action === 'confirm' ? 'checkmark-circle-outline' : 'close-circle-outline',
    icon_color: action === 'confirm' ? '#10B981' : '#EF4444',
    title: action === 'confirm' ? 'Payment Confirmed' : 'Payment Rejected',
    body: `Admin ${action === 'confirm' ? 'confirmed' : 'rejected'} ₦${Number(contrib.amount).toLocaleString()} for "${contrib.title}" (${contrib.submitted_by_name ?? 'Student'}).`,
    priority: 'normal',
  });

  await supabase.from('audit_logs').insert({
    action: action === 'confirm' ? 'Payment Confirmed' : 'Payment Rejected',
    user_id: req.user!.id,
    user_display: req.user!.id,
    role: req.user!.role,
    details: `₦${Number(contrib.amount).toLocaleString()} ${action === 'confirm' ? 'confirmed' : 'rejected'} for "${contrib.title}" — ${contrib.submitted_by_name ?? 'Student'}`,
  });

  res.json(data);
});

export default router;
