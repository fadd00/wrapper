import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { jwt } from '@elysiajs/jwt';
import { cors } from '@elysiajs/cors';
import { env } from './config/env';
import { testConnection } from './config/database';
import { authRoutes } from './routes/auth';
import { apiKeyRoutes } from './routes/apiKeys';
import { emailRoutes } from './routes/email';
import { logsRoutes } from './routes/logs';

// Test database connection
await testConnection();

const app = new Elysia()
  // CORS configuration
  .use(cors({
    origin: true,
    credentials: true,
  }))

  // JWT configuration
  .use(jwt({
    name: 'jwt',
    secret: env.JWT_SECRET,
    exp: '7d'
  }))

  // Swagger documentation
  .use(swagger({
    documentation: {
      info: {
        title: 'Wrapper API Documentation',
        version: '1.0.0',
        description: 'Email Receipt API Wrapper - Send beautiful receipt emails via Resend'
      },
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'API Keys', description: 'API key management' },
        { name: 'Email', description: 'Email sending endpoints' },
        { name: 'Logs', description: 'Request logs' }
      ]
    }
  }))

  // Health check
  .get('/', () => ({
    success: true,
    message: 'Wrapper API is running',
    version: '1.0.0',
    docs: '/swagger'
  }))

  // Register routes
  .use(authRoutes)
  .use(apiKeyRoutes)
  .use(emailRoutes)
  .use(logsRoutes)

  // Global error handler
  .onError(({ code, error, set }) => {
    console.error('Error:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: 'Validation error',
        message: errorMessage
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: 'Not found',
        message: 'The requested resource was not found'
      };
    }

    set.status = 500;
    return {
      success: false,
      error: 'Internal server error',
      message: errorMessage || 'An unexpected error occurred'
    };
  })

  .listen(env.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 API Documentation: http://${app.server?.hostname}:${app.server?.port}/swagger`);
