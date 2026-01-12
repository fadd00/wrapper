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

    .get('/', async ({ user }) => {
        // Admin can see all logs, users only see their own
        const whereClause = user.role === 'ADMIN'
            ? {}
            : {
                apiKey: {
                    userId: user.userId
                }
            };

        const logs = await prisma.log.findMany({
            where: whereClause,
            include: {
                apiKey: {
                    select: {
                        keyString: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 100
        });

        return {
            success: true,
            data: logs.map(log => ({
                id: log.id,
                endpoint: log.endpoint,
                status: log.status,
                requestData: log.requestData,
                responseData: log.responseData,
                timestamp: log.timestamp,
                apiKey: log.apiKey.keyString.substring(0, 10) + '...', // Mask the key
                ...(user.role === 'ADMIN' && {
                    userEmail: log.apiKey.user.email
                })
            }))
        };
    });
