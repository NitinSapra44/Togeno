import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createRateLimit(options: { windowMs: number; max: number; message?: string }) {
  const store = new Map<string, RateLimitEntry>();

  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetAt) store.delete(key);
    });
  }, options.windowMs);

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    entry.count += 1;

    if (entry.count > options.max) {
      res.status(429).json({
        success: false,
        message: options.message ?? 'Too many requests, please try again later.',
      });
      return;
    }

    next();
  };
}
