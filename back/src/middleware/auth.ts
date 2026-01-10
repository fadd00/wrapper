import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { prisma } from '../config/database';
import { isValidApiKeyFormat } from '../utils/apiKey';
import { env } from '../config/env';

export const requireAuth = new Elysia()
    .use(jwt({
        name: 'jwt',
        secret: env.JWT_SECRET,
    }))
    .derive(async ({ headers, jwt }) => {
        const authHeader = headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new Error('Missing or invalid authorization header');
        }

        const token = authHeader.substring(7);
        const payload = await jwt.verify(token);

        if (!payload) {
            throw new Error('Invalid or expired token');
        }

        return {
            user: payload as { userId: number; email: string }
        };
    });

/**
 * API Key validation middleware
 */
export const requireApiKey = new Elysia()
    .derive(async ({ headers }) => {
        const apiKey = headers['x-api-key'];

        if (!apiKey) {
            throw new Error('Missing X-API-Key header');
        }

        if (!isValidApiKeyFormat(apiKey)) {
            throw new Error('Invalid API key format');
        }

        // Check if API key exists and is active
        const keyData = await prisma.apiKey.findUnique({
            where: { keyString: apiKey },
            select: {
                id: true,
                userId: true,
                isActive: true
            }
        });

        if (!keyData) {
            throw new Error('Invalid API key');
        }

        if (!keyData.isActive) {
            throw new Error('API key has been revoked');
        }

        return {
            apiKeyId: keyData.id,
            userId: keyData.userId
        };
    });
