import app from './app';
import { config } from './config';
import logger from './utils/logger';
import prisma from './config/database';

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    // Enable pgvector extension
    try {
      await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector');
      logger.info('pgvector extension enabled');
    } catch (e) {
      logger.warn('pgvector extension might already exist or is not available');
    }

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`AI Provider: ${config.ai.provider}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

main();
