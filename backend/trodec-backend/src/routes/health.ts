import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../config';
import { sendSuccess } from '../utils';
import { ApiError } from '../utils';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Querying a dummy table to check connection
    const { error } = await supabase.from('dummy_for_test').select('*').limit(1);

    // If the error is about the table not existing, it means the connection is fine
    const supabaseConnected = !error || error.code === '42P01';

    sendSuccess(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      supabase: {
        connected: supabaseConnected,
        error: supabaseConnected ? null : error?.message,
      },
    });
  } catch (err) {
    next(new ApiError('Health check failed', 500));
  }
});

export { router as healthRouter };
