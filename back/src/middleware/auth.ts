import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { prisma } from '../config/database';
import { isValidApiKeyFormat } from '../utils/apiKey';
import { env } from '../config/env';

/**
 * JWT Authentication middleware
 */
export const requireAuth = new Elysia()
    .use(jwt({
        name: 'jwt',
        secret: env.JWT_SECRET,
    }))
    .derive(async ({ headers, jwt, set }) => {
        const authHeader = headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            set.status = 401;
            throw new Error('Missing or invalid authorization header');
        }

        const token = authHeader.substring(7);
        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            throw new Error('Invalid or expired token');
        }

        return {
            user: {
                userId: payload.userId as number,
                email: payload.email as string
            }
        };
    });

/**
 * API Key validation middleware
 */
export const requireApiKey = new Elysia()
    .derive(async ({ headers, set }) => {
        const apiKey = headers['x-api-key'];

        if (!apiKey) {
            set.status = 401;
            throw new Error('Missing X-API-Key header');
        }

        if (!isValidApiKeyFormat(apiKey)) {
            set.status = 400;
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
            set.status = 401;
            throw new Error('Invalid API key');
        }

        if (!keyData.isActive) {
            set.status = 403;
            throw new Error('API key has been revoked');
        }

        return {
            apiKeyId: keyData.id,
            userId: keyData.userId
        };
    });
