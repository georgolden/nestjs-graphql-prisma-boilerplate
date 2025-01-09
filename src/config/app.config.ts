import 'dotenv/config';

const { env } = process;

export const HOST = env.HOST || 'localhost';
export const PORT = Number.parseInt(env.PORT, 10) || 3000;
export const CORS_ORIGIN = env.CORS_ORIGIN || 'http://localhost:3002';
