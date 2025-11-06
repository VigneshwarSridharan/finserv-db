import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerDocument } from './utils/swagger';
import authRoutes from './routes/auth.routes';
import portfolioRoutes from './routes/portfolio.routes';

// Securities Domain Routes
import brokersRoutes from './routes/brokers.routes';
import securitiesRoutes from './routes/securities.routes';
import securityPricesRoutes from './routes/security-prices.routes';
import marketDataRoutes from './routes/market-data.routes';
import userBrokerAccountsRoutes from './routes/user-broker-accounts.routes';
import securityHoldingsRoutes from './routes/security-holdings.routes';
import securityTransactionsRoutes from './routes/security-transactions.routes';

// Banking Domain Routes
import banksRoutes from './routes/banks.routes';
import bankAccountsRoutes from './routes/bank-accounts.routes';
import fixedDepositsRoutes from './routes/fixed-deposits.routes';
import recurringDepositsRoutes from './routes/recurring-deposits.routes';
import bankTransactionsRoutes from './routes/bank-transactions.routes';

// Assets Domain Routes
import assetCategoriesRoutes from './routes/asset-categories.routes';
import assetsRoutes from './routes/assets.routes';
import realEstateRoutes from './routes/real-estate.routes';
import goldRoutes from './routes/gold.routes';
import assetValuationsRoutes from './routes/asset-valuations.routes';
import assetTransactionsRoutes from './routes/asset-transactions.routes';

// Portfolio Features Routes
import portfolioGoalsRoutes from './routes/portfolio-goals.routes';
import assetAllocationRoutes from './routes/asset-allocation.routes';
import portfolioAlertsRoutes from './routes/portfolio-alerts.routes';
import watchlistRoutes from './routes/watchlist.routes';
import portfolioPerformanceRoutes from './routes/portfolio-performance.routes';
import portfolioReportsRoutes from './routes/portfolio-reports.routes';
import portfolioOverviewRoutes from './routes/portfolio-overview.routes';

// User Profile Routes
import userProfileRoutes from './routes/user-profile.routes';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestContext } from './middleware/request-context';
import logger from './utils/logger';
import { checkDatabaseHealth, getDatabaseCircuitBreaker } from './config/database-resilient';
import { getCircuitBreakerStats } from './utils/circuit-breaker';

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

  // Request context middleware - adds request ID and logger
  app.use(requestContext);

  // Request logging middleware (structured logging)
  app.use((req: Request, res: Response, next: express.NextFunction) => {
    const startTime = Date.now();
    
    // Log incoming request
    logger.http('Incoming request', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'warn' : 'http';
      
      logger[logLevel]('Request completed', {
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('content-length'),
      });
    });

    next();
  });

  // Health check endpoint (enhanced)
  app.get('/health', async (_req: Request, res: Response) => {
    try {
      // Check database health
      const dbHealth = await checkDatabaseHealth();
      const dbCircuitBreaker = getDatabaseCircuitBreaker();
      const dbStats = getCircuitBreakerStats(dbCircuitBreaker);

      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const memoryMB = {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
      };

      // Calculate uptime
      const uptimeSeconds = process.uptime();
      const uptimeFormatted = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`;

      // Determine overall status
      const isHealthy = dbHealth.isHealthy;
      const status = isHealthy ? 'healthy' : 'unhealthy';
      const statusCode = isHealthy ? 200 : 503;

      res.status(statusCode).json({
        success: isHealthy,
        status,
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        uptime: uptimeFormatted,
        uptimeSeconds: Math.floor(uptimeSeconds),
        database: {
          status: dbHealth.isHealthy ? 'connected' : 'disconnected',
          circuitBreaker: {
            state: dbHealth.circuitState,
            stats: {
              successes: dbStats.successes,
              failures: dbStats.failures,
              rejects: dbStats.rejects,
              timeouts: dbStats.timeouts,
              latencyMean: Math.round(dbStats.latencyMean),
            },
          },
          error: dbHealth.error,
        },
        memory: memoryMB,
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
      });
    } catch (error: any) {
      logger.error('Health check failed', { error: error.message });
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
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

  // Securities Domain Routes
  app.use('/brokers', brokersRoutes);
  app.use('/securities', securitiesRoutes);
  app.use('/securities', securityPricesRoutes); // Nested routes for security prices
  app.use('/market-data', marketDataRoutes); // Market data routes for LTP fetching
  app.use('/accounts/brokers', userBrokerAccountsRoutes);
  app.use('/holdings/securities', securityHoldingsRoutes);
  app.use('/transactions/securities', securityTransactionsRoutes);

  // Banking Domain Routes
  app.use('/banks', banksRoutes);
  app.use('/accounts/banks', bankAccountsRoutes);
  app.use('/deposits/fixed', fixedDepositsRoutes);
  app.use('/deposits/recurring', recurringDepositsRoutes);
  app.use('/transactions/bank', bankTransactionsRoutes);

  // Assets Domain Routes
  app.use('/assets/categories', assetCategoriesRoutes);
  app.use('/assets', assetsRoutes);
  app.use('/assets', realEstateRoutes); // Nested routes for real estate details
  app.use('/assets', goldRoutes); // Nested routes for gold details
  app.use('/assets', assetValuationsRoutes); // Nested routes for asset valuations
  app.use('/transactions/assets', assetTransactionsRoutes);

  // Portfolio Features Routes
  app.use('/portfolio/goals', portfolioGoalsRoutes);
  app.use('/portfolio/allocation', assetAllocationRoutes);
  app.use('/portfolio/alerts', portfolioAlertsRoutes);
  app.use('/portfolio/watchlist', watchlistRoutes);
  app.use('/portfolio/performance', portfolioPerformanceRoutes);
  app.use('/portfolio/reports', portfolioReportsRoutes);
  app.use('/portfolio/overview', portfolioOverviewRoutes);

  // User Profile Routes
  app.use('/profile', userProfileRoutes);

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
        },
        brokers: {
          list: 'GET /brokers',
          getById: 'GET /brokers/:id',
          create: 'POST /brokers',
          update: 'PUT /brokers/:id',
          delete: 'DELETE /brokers/:id'
        },
        securities: {
          list: 'GET /securities',
          search: 'GET /securities/search',
          getById: 'GET /securities/:id',
          create: 'POST /securities',
          update: 'PUT /securities/:id',
          delete: 'DELETE /securities/:id',
          prices: 'GET /securities/:securityId/prices',
          addPrice: 'POST /securities/:securityId/prices',
          bulkPrices: 'POST /securities/prices/bulk'
        },
        accounts: {
          brokerAccounts: 'GET /accounts/brokers',
          createBrokerAccount: 'POST /accounts/brokers'
        },
        holdings: {
          securities: 'GET /holdings/securities',
          summary: 'GET /holdings/securities/summary'
        },
        transactions: {
          securities: 'GET /transactions/securities',
          create: 'POST /transactions/securities',
          bulkImport: 'POST /transactions/securities/bulk'
        },
        banks: {
          list: 'GET /banks',
          accounts: 'GET /accounts/banks',
          fixedDeposits: 'GET /deposits/fixed',
          recurringDeposits: 'GET /deposits/recurring'
        },
        assets: {
          categories: 'GET /assets/categories',
          list: 'GET /assets',
          create: 'POST /assets',
          realEstate: 'GET /assets/:assetId/real-estate',
          gold: 'GET /assets/:assetId/gold',
          valuations: 'GET /assets/:assetId/valuations',
          transactions: 'GET /transactions/assets'
        },
        portfolio: {
          overview: 'GET /portfolio/overview',
          dashboard: 'GET /portfolio/overview/dashboard',
          goals: 'GET /portfolio/goals',
          allocation: 'GET /portfolio/allocation',
          alerts: 'GET /portfolio/alerts',
          watchlist: 'GET /portfolio/watchlist',
          performance: 'GET /portfolio/performance',
          reports: 'GET /portfolio/reports'
        },
        profile: {
          get: 'GET /profile',
          update: 'PUT /profile',
          preferences: 'GET /profile/preferences'
        },
        note: 'Complete API with 100+ endpoints across securities, banking, assets, and portfolio domains. See /api-docs for full documentation.'
      }
    });
  });

  // 404 handler - must be after all routes
  app.use(notFoundHandler);

  // Global error handler - must be last
  app.use(errorHandler);

  return app;
}
