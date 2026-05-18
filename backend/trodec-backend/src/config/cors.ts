import { CorsOptions } from 'cors';
import { env } from './env';

const allowedOrigins = new Set(
  env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
);

export const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};
