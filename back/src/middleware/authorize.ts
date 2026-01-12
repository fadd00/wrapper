/**
 * Authorization middleware
 * Role-based access control for protected routes
 */

import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { env } from '../config/env';

// Create base auth middleware that adds user to context
export const authMiddleware = new Elysia({ name: 'auth' })
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
    });

// Export requireAuth as the middleware itself
export const requireAuth = () => authMiddleware;

// RequireAdmin extends auth middleware with role check
export const requireAdmin = () => new Elysia()
    .use(authMiddleware)
    .onBeforeHandle(({ user, set }) => {
        if (user.role !== 'ADMIN') {
            set.status = 403;
            throw new Error('Admin access required');
        }
    });
