import { createApp } from './app';
import { env } from './config/env';
import { testConnection, closeConnection } from './config/database';

/**
 * Start the Express server
 */
async function startServer() {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Create Express app
    const app = createApp();

    // Start server
    const PORT = parseInt(env.PORT);
    const server = app.listen(PORT, () => {
      console.log('\n=================================================');
      console.log('🚀 Portfolio Management API Server Started');
      console.log('=================================================');
      console.log(`📍 Server:        http://localhost:${PORT}`);
      console.log(`📚 API Docs:      http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check:  http://localhost:${PORT}/health`);
      console.log(`🌍 Environment:   ${env.NODE_ENV}`);
      console.log('=================================================\n');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        // Close database connection
        await closeConnection();
        
        console.log('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
