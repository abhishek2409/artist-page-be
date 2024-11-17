// backend/src/queues/analyticsQueue.ts

import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import { logger } from '../logger';
import config from '../../config/config';

dotenv.config();

// Redis connection configuration
export const connection = {
  host: config.redis.host,
  port: config.redis.port,
};

// Initialize BullMQ Queue
const analyticsQueue = new Queue('analyticsQueue', { connection });

/**
 * Enqueues a new analytics report generation job.
 * @param userId - ID of the user requesting the report.
 * @returns The job ID.
 */
export const enqueueAnalyticsJob = async (userId: string): Promise<string> => {
  try {
    const job = await analyticsQueue.add(
      'generateReport', // Job name
      { userId }, // Job data
      {
        attempts: 3, // Retry up to 3 times on failure
        backoff: {
          type: 'exponential',
          delay: 5000, // Initial delay of 5 seconds
        },
      }
    );
    logger.info(`Enqueued analytics job ${job.id} for user ${userId}`);
    return job.id as string;
  } catch (error) {
    logger.error('Failed to enqueue analytics job:', error);
    throw error;
  }
};

export default analyticsQueue;
