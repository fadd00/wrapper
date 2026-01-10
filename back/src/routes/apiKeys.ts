import { Elysia, t } from 'elysia';
import { prisma } from '../config/database';
import { generateApiKey } from '../utils/apiKey';
import { requireAuth } from '../middleware/auth';

export const apiKeyRoutes = new Elysia({ prefix: '/api-keys' })
    .use(requireAuth)

    .post('/generate', async (context) => {
        const { user } = context as any;
        const apiKey = generateApiKey();

        const newKey = await prisma.apiKey.create({
            data: {
                userId: user.userId,
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
    })

    .get('/list', async (context) => {
        const { user } = context as any;
        const keys = await prisma.apiKey.findMany({
            where: { userId: user.userId },
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
    })

    .patch('/revoke/:id', async (context) => {
        const { user, params } = context as any;
        const keyId = parseInt(params.id);

        // Check if key belongs to user
        const key = await prisma.apiKey.findFirst({
            where: {
                id: keyId,
                userId: user.userId
            }
        });

        if (!key) {
            throw new Error('API key not found');
        }

        await prisma.apiKey.update({
            where: { id: keyId },
            data: { isActive: false }
        });

        return {
            success: true,
            message: 'API key revoked successfully'
        };
    }, {
        params: t.Object({
            id: t.String()
        })
    });
