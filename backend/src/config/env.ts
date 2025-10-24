import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://portfolio_user:portfolio_password@localhost:5432/portfolio_management'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_NAME: z.string().default('portfolio_management'),
  DB_USER: z.string().default('portfolio_user'),
  DB_PASSWORD: z.string().default('portfolio_password'),
  JWT_SECRET: z.string().default('your_super_secret_jwt_key_change_this_in_production'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3001')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
