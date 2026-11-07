import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'node:child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isMainScript =
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));

if (isMainScript) {
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
}

export function resolvePort(
  args: string[] = process.argv,
  env: Record<string, string | undefined> = process.env
): number {
  // Check CLI arguments first (e.g. --port 3000, -p 3000, --port=3000)
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--port' || args[i] === '-p') && args[i + 1]) {
      const p = parseInt(args[i + 1], 10);
      if (!isNaN(p)) return p;
    }
    if (args[i].startsWith('--port=')) {
      const p = parseInt(args[i].split('=')[1], 10);
      if (!isNaN(p)) return p;
    }
  }

  if (env.APP_PORT) {
    const p = parseInt(env.APP_PORT, 10);
    if (!isNaN(p)) return p;
  }

  // In Google Cloud Run / AI Studio containers, PORT=8080 is reserved for Nginx proxy
  // The dev server process must listen on port 3000
  if (env.PORT && env.PORT !== '8080') {
    const p = parseInt(env.PORT, 10);
    if (!isNaN(p)) return p;
  }

  return 3000;
}

async function startServer() {
  const { coachRouter } = await import('./src/server/coachRouter');
  const app = express();
  const PORT = resolvePort();
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
      server: {
        middlewareMode: true,
        hmr: false,
      },
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
