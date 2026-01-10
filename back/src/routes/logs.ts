/**
 * Logs routes
 * Fetch request logs for authenticated users
 */

import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { env } from '../config/env';
import { prisma } from '../config/database';

export const logsRoutes = new Elysia({ prefix: '/logs' })
    .use(jwt({
        name: 'jwt',
        secret: env.JWT_SECRET,
    }))

    .get('/', async ({ headers, jwt: jwtService, set }) => {
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

            // Get logs
            const logs = await prisma.log.findMany({
                where: {
                    apiKey: {
                        userId: payload.userId
                    }
                },
                include: {
                    apiKey: {
                        select: {
                            keyString: true
                        }
                    }
                },
                orderBy: { timestamp: 'desc' },
                take: 100
            });

            return {
                success: true,
                data: logs.map((log: any) => ({
                    id: log.id,
                    endpoint: log.endpoint,
                    status: log.status,
                    requestData: log.requestData,
                    responseData: log.responseData,
                    timestamp: log.timestamp,
                    apiKey: log.apiKey.keyString.substring(0, 10) + '...' // Mask the key
                }))
            };
        } catch (error: any) {
            set.status = 500;
            return {
                success: false,
                error: 'Failed to load logs',
                message: error.message || 'An error occurred'
            };
        }
    });
