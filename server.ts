import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app, ensureDataLoaded } from './api/index.ts';

const PORT = 3000;

async function startServer() {
    // Pre-load data in background
    ensureDataLoaded().catch((err) => {
        console.warn('[Server] Initial data load warning:', err);
    });

    // Vite middleware setup
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });

        // Handle direct stylesheet requests with proper text/css MIME type
        app.get('/src/index.css', async (req, res, next) => {
            const isCssRequest = req.headers.accept?.includes('text/css') || req.query.direct !== undefined;
            if (isCssRequest) {
                try {
                    const result = await vite.transformRequest('/src/index.css?direct');
                    if (result && result.code) {
                        res.setHeader('Content-Type', 'text/css');
                        return res.send(result.code);
                    }
                } catch (e) {
                    console.error('[Vite] Error serving direct index.css:', e);
                }
            }
            next();
        });

        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`PharmaCare Server running on http://0.0.0.0:${PORT}`);
    });
}

startServer();
