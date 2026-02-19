import { Router } from 'express';
import { z } from 'zod';
import { Task } from '../models/Task.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { cacheTasks, invalidateTasksCache } from '../middleware/cache.js';
import { redisClient } from '../config/redis.js';

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'completed']).optional(),
  dueDate: z.string().datetime().optional()
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'completed']).optional(),
  dueDate: z.string().datetime().nullable().optional()
});

router.get('/', authMiddleware, cacheTasks, async (req: AuthRequest, res) => {
  const userId = req.userId as string;

  const status = req.query.status as string | undefined;
  const dueDate = req.query.dueDate as string | undefined;

  const query: Record<string, unknown> = { owner: userId };
  if (status === 'pending' || status === 'completed') {
    query.status = status;
  }
  if (dueDate) {
    query.dueDate = { $lte: new Date(dueDate) };
  }

  const tasks = await Task.find(query).sort({ createdAt: -1 });

  const key = res.locals.cacheKey as string | undefined;
  if (key) {
    await redisClient.set(key, JSON.stringify(tasks), { EX: 60 });
  }

  return res.status(200).json(tasks);
});

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
  }

  const userId = req.userId as string;
  const data = parsed.data;

  const task = await Task.create({
    title: data.title,
    description: data.description,
    status: data.status || 'pending',
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    owner: userId
  });

  await invalidateTasksCache(userId);

  return res.status(201).json(task);
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
  }

  const userId = req.userId as string;
  const update: Record<string, unknown> = {};

  if (parsed.data.title !== undefined) update.title = parsed.data.title;
  if (parsed.data.description !== undefined) update.description = parsed.data.description;
  if (parsed.data.status !== undefined) update.status = parsed.data.status;
  if (parsed.data.dueDate !== undefined) {
    update.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: userId },
    update,
    { new: true }
  );

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await invalidateTasksCache(userId);
  return res.status(200).json(task);
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId as string;
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: userId });
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await invalidateTasksCache(userId);
  return res.status(200).json({ message: 'Deleted' });
});

export default router;
