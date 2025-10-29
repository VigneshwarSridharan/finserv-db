import { createApp } from './app';
import { env } from './config/env';
import { testConnection, closeConnection } from './config/database';
import logger from './utils/logger';

/**
 * Start the Express server
 */
async function startServer() {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Create Express app
    const app = createApp();

    // Start server
    const PORT = parseInt(env.PORT);
    const server = app.listen(PORT, () => {
      logger.info('\n=================================================');
      logger.info('🚀 Portfolio Management API Server Started');
      logger.info('=================================================');
      logger.info(`📍 Server:        http://localhost:${PORT}`);
      logger.info(`📚 API Docs:      http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check:  http://localhost:${PORT}/health`);
      logger.info(`🌍 Environment:   ${env.NODE_ENV}`);
      logger.info('=================================================\n');
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Set a timeout for shutdown
      const shutdownTimeout = setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, env.GRACEFUL_SHUTDOWN_TIMEOUT);

      try {
        // Stop accepting new connections
        server.close(async () => {
          logger.info('HTTP server closed - no longer accepting connections');
          
          // Close database connection
          await closeConnection();
          logger.info('Database connections closed');
          
          // Clear timeout
          clearTimeout(shutdownTimeout);
          
          logger.info('Graceful shutdown completed');
          process.exit(0);
        });
      } catch (error) {
        logger.error('Error during graceful shutdown', { error });
        clearTimeout(shutdownTimeout);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception - Critical Error', {
        error: error.message,
        stack: error.stack,
        type: error.name,
      });
      
      // Attempt graceful shutdown
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Promise Rejection', {
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise: String(promise),
      });
      
      // Don't crash the app, just log it
      // In production, you might want to trigger alerts
    });

    // Handle process warnings
    process.on('warning', (warning: Error) => {
      logger.warn('Process Warning', {
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
      });
    });

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer();
