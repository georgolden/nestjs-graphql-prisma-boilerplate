import 'dotenv/config';

const { env } = process;

export const SIGNING_KEY = env.SIGNING_KEY || 'your-default-signing-key';
export const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
export const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
export const CORS_ORIGIN = env.CORS_ORIGIN || 'http://localhost:3002';
