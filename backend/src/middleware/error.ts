import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response) {
  return res.status(404).json({ message: 'Not Found' });
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  return res.status(500).json({ message: 'Server Error' });
}
