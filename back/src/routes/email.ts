/**
 * Email sending routes
 * Send receipt emails via Resend
 */

import { Elysia, t } from 'elysia';
import { Resend } from 'resend';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { generateReceiptHTML } from '../templates/receipt';
import { isValidApiKeyFormat } from '../utils/apiKey';

const resend = new Resend(env.RESEND_API_KEY);

export const emailRoutes = new Elysia({ prefix: '/api' })

    .post('/send-receipt', async ({ headers, body, set }) => {
        try {
            // Validate API key
            const apiKey = headers['x-api-key'];

            if (!apiKey) {
                set.status = 401;
                return {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Missing X-API-Key header'
                };
            }

            if (!isValidApiKeyFormat(apiKey)) {
                set.status = 400;
                return {
                    success: false,
                    error: 'Bad Request',
                    message: 'Invalid API key format'
                };
            }

            // Check if API key exists and is active
            const keyData = await prisma.apiKey.findUnique({
                where: { keyString: apiKey },
                select: {
                    id: true,
                    userId: true,
                    isActive: true
                }
            });

            if (!keyData) {
                set.status = 401;
                return {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid API key'
                };
            }

            if (!keyData.isActive) {
                set.status = 403;
                return {
                    success: false,
                    error: 'Forbidden',
                    message: 'API key has been revoked'
                };
            }

            const { item, harga, email } = body;

            // Generate HTML template
            const htmlContent = generateReceiptHTML({ item, harga, email });

            // Send email via Resend
            const result = await resend.emails.send({
                from: env.FROM_EMAIL,
                to: email,
                subject: `Struk Pembelian - ${item}`,
                html: htmlContent,
            });

            // Log successful request
            await prisma.log.create({
                data: {
                    apiKeyId: keyData.id,
                    endpoint: '/api/send-receipt',
                    status: 'success',
                    requestData: body as any,
                    responseData: { emailId: result.data?.id }
                }
            });

            return {
                success: true,
                message: 'Receipt sent successfully',
                data: {
                    emailId: result.data?.id,
                    recipient: email
                }
            };
        } catch (error: any) {
            // Try to log error if we have apiKeyId
            try {
                const apiKey = headers['x-api-key'];
                if (apiKey) {
                    const keyData = await prisma.apiKey.findUnique({
                        where: { keyString: apiKey },
                        select: { id: true }
                    });

                    if (keyData) {
                        await prisma.log.create({
                            data: {
                                apiKeyId: keyData.id,
                                endpoint: '/api/send-receipt',
                                status: 'error',
                                requestData: body as any,
                                responseData: { error: error.message }
                            }
                        });
                    }
                }
            } catch (logError) {
                // Ignore log errors
                console.error('Failed to log error:', logError);
            }

            set.status = 500;
            return {
                success: false,
                error: 'Email send failed',
                message: error.message || 'An error occurred'
            };
        }
    }, {
        body: t.Object({
            item: t.String({ minLength: 1 }),
            harga: t.String({ pattern: '^[0-9]+$' }),
            email: t.String({ format: 'email' })
        })
    });
