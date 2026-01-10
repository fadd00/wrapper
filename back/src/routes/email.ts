/**
 * Email sending routes
 * Send receipt emails via Resend
 */

import { Elysia, t } from 'elysia';
import { Resend } from 'resend';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { generateReceiptHTML } from '../templates/receipt';
import { requireApiKey } from '../middleware/auth';

const resend = new Resend(env.RESEND_API_KEY);

export const emailRoutes = new Elysia({ prefix: '/api' })
    .use(requireApiKey)

    .post('/send-receipt', async (context) => {
        const { body, apiKeyId } = context as any;
        const { item, harga, email } = body;

        try {
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
                    apiKeyId,
                    endpoint: '/api/send-receipt',
                    status: 'success',
                    requestData: body,
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
            // Log failed request
            await prisma.log.create({
                data: {
                    apiKeyId,
                    endpoint: '/api/send-receipt',
                    status: 'error',
                    requestData: body,
                    responseData: { error: error.message }
                }
            });

            throw new Error(`Failed to send email: ${error.message}`);
        }
    }, {
        body: t.Object({
            item: t.String({ minLength: 1 }),
            harga: t.String({ pattern: '^[0-9]+$' }),
            email: t.String({ format: 'email' })
        })
    });
