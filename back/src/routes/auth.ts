/**
 * Authentication routes
 * User registration and login with JWT
 */

import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { env } from '../config/env';

export const authRoutes = new Elysia({ prefix: '/auth' })
    .use(jwt({
        name: 'jwt',
        secret: env.JWT_SECRET,
        exp: '7d'
    }))
    .post('/register', async ({ body, jwt }) => {
        const { email, password } = body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            },
            select: {
                id: true,
                email: true,
                createdAt: true
            }
        });

        // Generate JWT token
        const token = await jwt.sign({
            userId: user.id,
            email: user.email
        });

        return {
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.createdAt
                },
                token
            }
        };
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 6 })
        })
    })

    .post('/login', async ({ body, jwt }) => {
        const { email, password } = body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        // Generate JWT token
        const token = await jwt.sign({
            userId: user.id,
            email: user.email
        });

        return {
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.createdAt
                },
                token
            }
        };
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String()
        })
    });
