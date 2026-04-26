import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Lightweight stand-in for Vercel's serverless runtime. In dev, we load
// /api/*.js modules dynamically and serve them from Vite's middleware so a
// plain `vite` command can hit /api/standings without `vercel dev`. In
// production, Vercel auto-handles /api/* and this plugin does nothing.
function devApiPlugin() {
  return {
    name: 'dev-api',
    apply: 'serve',
    config(_config, { mode }) {
      // Make non-VITE_ env vars (like FOOTBALL_DATA_API_KEY) visible to
      // server-side handlers via process.env. Vite normally only exposes
      // VITE_-prefixed vars, and only to the client.
      const env = loadEnv(mode, process.cwd(), '');
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();

        // Strip query string + leading /api/ to get the handler path.
        const [pathname, search = ''] = req.url.split('?');
        const file = pathname.replace(/^\/api\//, '').replace(/\/$/, '');

        // Try .js then .jsx so JSX-using handlers (e.g. og.jsx for @vercel/og)
        // resolve correctly. Vercel's runtime accepts either extension.
        const candidatePaths = [`/api/${file}.js`, `/api/${file}.jsx`];

        try {
          let mod;
          let lastErr;
          for (const p of candidatePaths) {
            try { mod = await server.ssrLoadModule(p); break; }
            catch (err) { lastErr = err; }
          }
          if (!mod) throw lastErr ?? new Error('Handler not found');
          const handler = mod.default;
          if (typeof handler !== 'function') {
            res.statusCode = 500;
            res.end(`No default export from ${modPath}`);
            return;
          }
          req.query = Object.fromEntries(new URLSearchParams(search));
          const result = await handler(req, res);

          // If the handler returned a Web `Response` (e.g. ImageResponse from
          // @vercel/og), pipe it back through Node's res. Existing handlers
          // that call res.end() directly return undefined and skip this.
          if (result && typeof result === 'object' && typeof result.body !== 'undefined' && typeof result.status === 'number' && !res.writableEnded) {
            res.statusCode = result.status;
            result.headers?.forEach?.((v, k) => res.setHeader(k, v));
            if (result.body) {
              const reader = result.body.getReader();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
              }
            }
            res.end();
          }
        } catch (e) {
          if (e?.code === 'ERR_MODULE_NOT_FOUND' || /Cannot find/i.test(String(e))) {
            return next(); // unmatched /api/ path — let Vite 404 it
          }
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message || String(e) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: { port: 5173 },
});
