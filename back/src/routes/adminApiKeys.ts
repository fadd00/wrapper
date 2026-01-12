/**
 * Admin API Key routes
 * Admin dapat CRUD semua API keys untuk semua user
 */

import { Elysia, t } from 'elysia';
import { prisma } from '../config/database';
import { requireAdmin } from '../middleware/authorize';
import { generateApiKey } from '../utils/apiKey';

export const adminApiKeyRoutes = new Elysia({ prefix: '/admin/keys' })
    .use(requireAdmin())

    // Get all API keys (all users)
    .get('/', async ({ set }) => {
        try {
            const keys = await prisma.apiKey.findMany({
                select: {
                    id: true,
                    keyString: true,
                    isActive: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return {
                success: true,
                data: keys.map(key => ({
                    id: key.id,
                    key: key.keyString,
                    isActive: key.isActive,
                    createdAt: key.createdAt,
                    user: {
                        id: key.user.id,
                        email: key.user.email
                    }
                }))
            };
        } catch (error: any) {
            console.error('Admin keys fetch error:', error);
            set.status = 500;
            return {
                success: false,
                error: 'Failed to fetch API keys',
                message: error.message || 'An error occurred'
            };
        }
    })

    // Create API key untuk user tertentu
    .post('/', async ({ body, set }) => {
        try {
            const { userId } = body;

            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                set.status = 404;
                return {
                    success: false,
                    error: 'Not found',
                    message: 'User not found'
                };
            }

            // Generate API key
            const apiKey = generateApiKey();

            const newKey = await prisma.apiKey.create({
                data: {
                    userId,
                    keyString: apiKey
                },
                select: {
                    id: true,
                    keyString: true,
                    isActive: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            email: true
                        }
                    }
                }
            });

            return {
                success: true,
                message: 'API key created successfully',
                data: {
                    id: newKey.id,
                    key: newKey.keyString,
                    isActive: newKey.isActive,
                    createdAt: newKey.createdAt,
                    user: {
                        id: newKey.user.id,
                        email: newKey.user.email
                    }
                }
            };
        } catch (error: any) {
            set.status = 500;
            return {
                success: false,
                error: 'Failed to create API key',
                message: error.message || 'An error occurred'
            };
        }
    }, {
        body: t.Object({
            userId: t.Number()
        })
    })

    // Toggle API key active status
    .patch('/:id/toggle', async ({ params, set }) => {
        try {
            const keyId = parseInt(params.id);

            const key = await prisma.apiKey.findUnique({
                where: { id: keyId }
            });

            if (!key) {
                set.status = 404;
                return {
                    success: false,
                    error: 'Not found',
                    message: 'API key not found'
                };
            }

            const updated = await prisma.apiKey.update({
                where: { id: keyId },
                data: { isActive: !key.isActive }
            });

            return {
                success: true,
                message: `API key ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
                data: {
                    id: updated.id,
                    isActive: updated.isActive
                }
            };
        } catch (error: any) {
            set.status = 500;
            return {
                success: false,
                error: 'Failed to toggle API key',
                message: error.message || 'An error occurred'
            };
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })

    // Delete API key
    .delete('/:id', async ({ params, set }) => {
        try {
            const keyId = parseInt(params.id);

            const key = await prisma.apiKey.findUnique({
                where: { id: keyId }
            });

            if (!key) {
                set.status = 404;
                return {
                    success: false,
                    error: 'Not found',
                    message: 'API key not found'
                };
            }

            await prisma.apiKey.delete({
                where: { id: keyId }
            });

            return {
                success: true,
                message: 'API key deleted successfully'
            };
        } catch (error: any) {
            set.status = 500;
            return {
                success: false,
                error: 'Failed to delete API key',
                message: error.message || 'An error occurred'
            };
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    });
