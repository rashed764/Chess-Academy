import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'node:child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isTsxRunning =
  process.env.__TSX_BOOTSTRAPPED__ === 'true' ||
  process.execArgv.some((arg) => arg.includes('tsx'));

if (!isTsxRunning) {
  process.env.__TSX_BOOTSTRAPPED__ = 'true';
  const child = spawn(process.execPath, ['--import', 'tsx', ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 0);
  });
} else {
  startServer().catch((err) => {
    console.error('[Chess Academy] Server startup failed:', err);
    process.exit(1);
  });
}

async function startServer() {
  const { coachRouter } = await import('./src/server/coachRouter');
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Respect reverse proxy (Google Cloud Run / Load Balancer) headers
  app.set('trust proxy', 1);

  // Bounded request body payload to prevent denial of service (chess JSON payloads < 10kb)
  app.use(express.json({ limit: '200kb' }));

  // Mount Coach API router
  app.use('/api/coach', coachRouter);

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  if (!isProd) {
    // In development mode, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve built dist files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Chess Academy] Server running on http://0.0.0.0:${PORT}`);
  });
}
