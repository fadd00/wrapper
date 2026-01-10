/**
 * Environment variables configuration
 * Validates and exports all required environment variables
 */

const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'RESEND_API_KEY',
] as const;

// Validate required environment variables
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

export const env = {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    RESEND_API_KEY: process.env.RESEND_API_KEY!,
    PORT: parseInt(process.env.PORT || '3000'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@wrapper.dev',
} as const;
