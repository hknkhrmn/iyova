import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import journalRoutes from './routes/journalRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import medRoutes from './routes/medRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// ── Routes ─────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'İyova API' }));
app.use('/api/journal', journalRoutes);
app.use('/api/ai',      aiRoutes);
app.use('/api/meds',    medRoutes);

// ── Error Handling ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 İyova API çalışıyor → http://localhost:${PORT}`);
  });
});
