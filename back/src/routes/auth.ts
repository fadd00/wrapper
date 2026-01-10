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
    .post('/register', async ({ body, jwt, set }) => {
        try {
            const { email, password } = body;

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                set.status = 400;
                return {
                    success: false,
                    error: 'Registration failed',
                    message: 'User already exists'
                };
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
        } catch (error: any) {
            set.status = 500;
            return {
                success: false,
                error: 'Registration failed',
                message: error.message || 'An error occurred'
            };
        }
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 6 })
        })
    })

    .post('/login', async ({ body, jwt, set }) => {
        try {
            const { email, password } = body;

            // Find user
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                set.status = 401;
                return {
                    success: false,
                    error: 'Login failed',
                    message: 'Invalid email or password'
                };
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                set.status = 401;
                return {
                    success: false,
                    error: 'Login failed',
                    message: 'Invalid email or password'
                };
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
        } catch (error: any) {
            set.status = 500;
            return {
                success: false,
                error: 'Login failed',
                message: error.message || 'An error occurred'
            };
        }
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String()
        })
    });
