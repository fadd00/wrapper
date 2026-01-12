/**
 * Admin User Management routes
 * Admin dapat melihat dan manage semua users
 */

import { Elysia } from 'elysia';
import { prisma } from '../config/database';
import { requireAdmin } from '../middleware/authorize';

export const adminUserRoutes = new Elysia({ prefix: '/admin/users' })
    .use(requireAdmin())

    // Get all users
    .get('/', async () => {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        apiKeys: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            data: users.map(user => ({
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                apiKeyCount: user._count.apiKeys
            }))
        };
    });
