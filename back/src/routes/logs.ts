/**
 * Logs routes
 * Fetch request logs for authenticated users
 */

import { Elysia } from 'elysia';
import { prisma } from '../config/database';
import { requireAuth } from '../middleware/auth';

export const logsRoutes = new Elysia({ prefix: '/logs' })
    .use(requireAuth)

    .get('/', async (context) => {
        const { user } = context as any;
        const logs = await prisma.log.findMany({
            where: {
                apiKey: {
                    userId: user.userId
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
    });
