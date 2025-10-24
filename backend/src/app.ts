import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerDocument } from './utils/swagger';
import authRoutes from './routes/auth.routes';
import portfolioRoutes from './routes/portfolio.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // CORS Configuration
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware (simple logger)
  app.use((req: Request, _res: Response, next: express.NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV
    });
  });

  // API Documentation - Swagger UI
  // @ts-ignore
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Portfolio Management API Documentation'
  }));

  // API Routes
  app.use('/auth', authRoutes);
  app.use('/portfolios', portfolioRoutes);

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Portfolio Management API',
      version: '1.0.0',
      documentation: '/api-docs',
      endpoints: {
        health: '/health',
        auth: {
          register: 'POST /auth/register',
          login: 'POST /auth/login'
        },
        portfolios: {
          getAll: 'GET /portfolios',
          getById: 'GET /portfolios/:id',
          create: 'POST /portfolios',
          update: 'PUT /portfolios/:id',
          delete: 'DELETE /portfolios/:id'
        }
      }
    });
  });

  // 404 handler - must be after all routes
  app.use(notFoundHandler);

  // Global error handler - must be last
  app.use(errorHandler);

  return app;
}
