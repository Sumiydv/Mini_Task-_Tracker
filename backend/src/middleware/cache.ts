import { Response, NextFunction } from 'express';
import { redisClient } from '../config/redis.js';
import { AuthRequest } from './auth.js';

export async function cacheTasks(req: AuthRequest, res: Response, next: NextFunction) {
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

export async function invalidateTasksCache(userId: string) {
  const key = `tasks:${userId}`;
  await redisClient.del(key);
}
