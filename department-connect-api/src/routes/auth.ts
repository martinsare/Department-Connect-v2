import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../supabase.js';
import { signToken } from '../jwt.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { mapProfile } from '../mappers.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body as { identifier: string; password: string };
  if (!identifier || !password) {
    res.status(400).json({ error: 'identifier and password are required' });
    return;
  }

  const lower = identifier.toLowerCase().trim();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`matric_number.ilike.${lower},surname.ilike.${lower},staff_id.ilike.${lower}`)
    .limit(5);

  if (error || !profiles?.length) {
    res.status(401).json({ error: 'No account found with that identifier' });
    return;
  }

  let matched: any = null;
  for (const profile of profiles) {
    const { data: cred } = await supabase
      .from('user_credentials')
      .select('password_hash')
      .eq('profile_id', profile.id)
      .single();

    if (!cred) continue;
    const valid = await bcrypt.compare(password, cred.password_hash);
    if (valid) { matched = profile; break; }
  }

  if (!matched) {
    res.status(401).json({ error: 'Incorrect password' });
    return;
  }

  if (matched.status === 'pending') {
    const msg = matched.role === 'admin'
      ? 'Your teacher account is pending approval by Super Admin.'
      : 'Your account is pending approval by your Lecturer or Course Representative.';
    res.status(403).json({ error: msg });
    return;
  }
  if (matched.status === 'rejected') {
    res.status(403).json({ error: 'Your account was rejected. Please contact Admin.' });
    return;
  }
  if (matched.status === 'suspended') {
    res.status(403).json({ error: 'Your account has been suspended.' });
    return;
  }

  await supabase.from('audit_logs').insert({
    action: 'Login',
    user_id: matched.id,
    user_display: `${matched.surname} ${matched.first_name}`,
    role: matched.role,
    details: 'Logged in via API',
  });

  const token = signToken({
    id: matched.id,
    role: matched.role,
    subRole: matched.sub_role,
    status: matched.status,
  });

  res.json({ token, user: mapProfile(matched) });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { role, password, ...profileData } = req.body;

  if (!password || !role) {
    res.status(400).json({ error: 'role and password are required' });
    return;
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .insert({ ...profileData, role, status: 'pending' })
    .select()
    .single();

  if (profileErr || !profile) {
    res.status(400).json({ error: profileErr?.message ?? 'Registration failed' });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const { error: credErr } = await supabase
    .from('user_credentials')
    .insert({ profile_id: profile.id, password_hash: hash });

  if (credErr) {
    await supabase.from('profiles').delete().eq('id', profile.id);
    res.status(500).json({ error: 'Failed to store credentials' });
    return;
  }

  await supabase.from('audit_logs').insert({
    action: 'Account Created',
    user_id: profile.id,
    user_display: `${profile.surname} ${profile.first_name}`,
    role: profile.role,
    details: `New ${role} registration submitted`,
  });

  res.status(201).json({ user: mapProfile(profile) });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user!.id)
    .single();

  if (error || !data) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(mapProfile(data));
});

// PATCH /api/auth/me
router.patch('/me', requireAuth, async (req: AuthRequest, res) => {
  const { password, ...updates } = req.body;

  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await supabase.from('user_credentials').upsert({ profile_id: req.user!.id, password_hash: hash });
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', req.user!.id)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json(mapProfile(data));
});

export default router;
