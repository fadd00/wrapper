import { Elysia, t } from 'elysia';
import { prisma } from '../config/database';
import { jwt } from '@elysiajs/jwt';
import { env } from '../config/env';
import { generateApiKey } from '../utils/apiKey';

export const apiKeyRoutes = new Elysia({ prefix: '/api-keys' })
    .use(jwt({
        name: 'jwt',
        secret: env.JWT_SECRET,
    }))

    .post('/generate', async ({ headers, jwt: jwtService, set }) => {
        try {
            // Extract and verify JWT
            const authHeader = headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                set.status = 401;
                return {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Missing authorization header'
                };
            }

            const token = authHeader.substring(7);
            const payload = await jwtService.verify(token) as any;

            if (!payload || !payload.userId) {
                set.status = 401;
                return {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid token'
                };
            }

            // Generate API key
            const apiKey = generateApiKey();

            const newKey = await prisma.apiKey.create({
                data: {
                    userId: payload.userId,
                    keyString: apiKey
                },
                select: {
                    id: true,
                    keyString: true,
                    isActive: true,
                    createdAt: true
                }
            });

            return {
                success: true,
                message: 'API key generated successfully',
                data: {
                    id: newKey.id,
                    key: newKey.keyString,
                    isActive: newKey.isActive,
                    createdAt: newKey.createdAt
                }
            };
        } catch (error: any) {
            set.status = 500;
            return {
                success: false,
                error: 'Failed to generate API key',
                message: error.message || 'An error occurred'
            };
        }
    })

    .get('/list', async ({ headers, jwt: jwtService, set }) => {
        try {
            // Extract and verify JWT
            const authHeader = headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                set.status = 401;
                return {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Missing authorization header'
                };
            }

            const token = authHeader.substring(7);
            const payload = await jwtService.verify(token) as any;

            if (!payload || !payload.userId) {
                set.status = 401;
                return {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid token'
                };
            }

            // Get API keys
            const keys = await prisma.apiKey.findMany({
                where: { userId: payload.userId },
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
                data: keys.map((key: any) => ({
                    id: key.id,
                    key: key.keyString,
                    isActive: key.isActive,
                    createdAt: key.createdAt
                }))
            };
        } catch (error: any) {
            set.status = 500;
            return {
                success: false,
                error: 'Failed to load API keys',
                message: error.message || 'An error occurred'
            };
        }
    })

    .patch('/revoke/:id', async ({ headers, jwt: jwtService, params, set }) => {
        try {
            // Extract and verify JWT
            const authHeader = headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                set.status = 401;
                return {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Missing authorization header'
                };
            }

            const token = authHeader.substring(7);
            const payload = await jwtService.verify(token) as any;

            if (!payload || !payload.userId) {
                set.status = 401;
                return {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid token'
                };
            }

            // Revoke API key
            const keyId = parseInt(params.id);

            const key = await prisma.apiKey.findFirst({
                where: {
                    id: keyId,
                    userId: payload.userId
                }
            });

            if (!key) {
                set.status = 404;
                return {
                    success: false,
                    error: 'Not found',
                    message: 'API key not found'
                };
            }

            await prisma.apiKey.update({
                where: { id: keyId },
                data: { isActive: false }
            });

            return {
                success: true,
                message: 'API key revoked successfully'
            };
        } catch (error: any) {
            set.status = 500;
            return {
                success: false,
                error: 'Failed to revoke API key',
                message: error.message || 'An error occurred'
            };
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    });
