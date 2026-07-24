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

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV ?? 'development' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/contributions', contributionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Only listen when running locally — Vercel handles this in serverless
if (!process.env.VERCEL) {
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Department Connect API running on http://localhost:${port}`);
  });
}

export default app;
