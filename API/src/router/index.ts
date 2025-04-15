import { Router } from 'express';

export function createRouter() {

    const router = Router();

    router.get('/ping', (_req, res) => {
        res.json({ message: 'pong' });
    });

    return router;
}

