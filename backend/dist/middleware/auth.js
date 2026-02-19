import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    try {
        const payload = jwt.verify(token, env.jwtSecret);
        req.userId = payload.userId;
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
