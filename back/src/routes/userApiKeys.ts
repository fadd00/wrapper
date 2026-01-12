/**
 * API Key routes untuk User
 * User hanya dapat melihat API keys yang di-assign oleh admin
 */

import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { env } from '../config/env';
import { prisma } from '../config/database';

export const userApiKeyRoutes = new Elysia({ prefix: '/keys' })
    .use(jwt({
        name: 'jwt',
        secret: env.JWT_SECRET,
        exp: '7d'
    }))
    .derive(async ({ headers, jwt, set }) => {
        const auth = headers.authorization;

        if (!auth || !auth.startsWith('Bearer ')) {
            set.status = 401;
            throw new Error('Missing or invalid authorization header');
        }

        const token = auth.substring(7);
        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            throw new Error('Invalid or expired token');
        }

        return {
            user: {
                userId: payload.userId as number,
                email: payload.email as string,
                role: payload.role as 'ADMIN' | 'USER'
            }
        };
    })

    .get('/', async ({ user, set }) => {
        try {
            // Get API keys yang di-assign ke user ini
            const keys = await prisma.apiKey.findMany({
                where: {
                    userId: user.userId,
                    isActive: true  // Hanya show active keys
                },
                select: {
                    id: true,
                    keyString: true,
                    isActive: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return {
                success: true,
                data: keys.map(key => ({
                    id: key.id,
                    key: key.keyString,
                    isActive: key.isActive,
                    createdAt: key.createdAt
                }))
            };
        } catch (error: any) {
            console.error('User keys fetch error:', error);
            set.status = 500;
            return {
                success: false,
                error: 'Failed to fetch API keys',
                message: error.message || 'An error occurred'
            };
        }
    });
