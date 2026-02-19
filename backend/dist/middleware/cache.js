import { redisClient } from '../config/redis.js';
export async function cacheTasks(req, res, next) {
    if (!req.userId) {
        return next();
    }
    const key = `tasks:${req.userId}`;
    const cached = await redisClient.get(key);
    if (cached) {
        return res.status(200).json(JSON.parse(cached));
    }
    res.locals.cacheKey = key;
    return next();
}
export async function invalidateTasksCache(userId) {
    const key = `tasks:${userId}`;
    await redisClient.del(key);
}
