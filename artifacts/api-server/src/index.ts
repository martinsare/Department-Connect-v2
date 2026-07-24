import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import profilesRoutes from './routes/profiles.js';
import classesRoutes from './routes/classes.js';
import contributionsRoutes from './routes/contributions.js';
import notificationsRoutes from './routes/notifications.js';
import eventsRoutes from './routes/events.js';
import announcementsRoutes from './routes/announcements.js';
import auditLogsRoutes from './routes/audit-logs.js';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

// BASE_PATH is injected by Replit artifact routing (e.g. "/api-server").
// On Vercel or plain Node, it is empty string so routes sit at root.
const base = (process.env.BASE_PATH ?? '').replace(/\/$/, '');

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get(`${base}/health`, (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV ?? 'development' });
});

// API routes
app.use(`${base}/api/auth`, authRoutes);
app.use(`${base}/api/profiles`, profilesRoutes);
app.use(`${base}/api/classes`, classesRoutes);
app.use(`${base}/api/contributions`, contributionsRoutes);
app.use(`${base}/api/notifications`, notificationsRoutes);
app.use(`${base}/api/events`, eventsRoutes);
app.use(`${base}/api/announcements`, announcementsRoutes);
app.use(`${base}/api/audit-logs`, auditLogsRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Department Connect API running on port ${port} (base: "${base}")`);
});

export default app;
