import { defineConfig, type Plugin } from 'vite';

/** En desarrollo, sirve /api/sala con el mismo código que la Vercel Function. */
function apiLocal(): Plugin {
  return {
    name: 'api-local',
    configureServer(server) {
      server.middlewares.use('/api/sala', async (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const query = Object.fromEntries(url.searchParams);
        let cuerpo = '';
        for await (const parte of req) cuerpo += parte;
        const { manejar } = await server.ssrLoadModule('/src/server/api.ts');
        const r = await manejar(req.method ?? 'GET', query, cuerpo || null);
        res.statusCode = r.status;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(r.json));
      });
    },
  };
}

export default defineConfig({
  plugins: [apiLocal()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        galeria: 'galeria.html',
        mockup: 'mockup.html',
      },
    },
  },
});
