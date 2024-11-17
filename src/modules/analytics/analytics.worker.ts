// backend/src/workers/analyticsWorker.ts

import { Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import Report from './analytics.model';
import { logger } from '../logger';
import { ioServer } from '../../index';
import { UserInsights } from './analytics.interfaces';
import { fetchUserInsights } from '../instagram/instagram.service';
import { connection } from './analytics.queue';

dotenv.config();

// Initialize BullMQ Worker
const analyticsWorker = new Worker(
  'analyticsQueue',
  async (job: Job<{ userId: string }, void, string>) => {
    const { userId } = job.data;
    const jobId = uuidv4();

    try {
      logger.info(`Processing analytics job ${job.id} for user ${userId} (Generated Report ID: ${jobId})`);

      // Fetch user insights from Instagram Graph API
      const userInsights: UserInsights = await fetchUserInsights(new mongoose.Types.ObjectId(userId));

      // Compile report data
      const reportData = {
        userId,
        reportId: jobId,
        reportData: userInsights,
        generatedAt: new Date(),
      };

      // Store the report in the database
      await Report.create(reportData);
      logger.info(`Analytics report ${jobId} generated and stored for user ${userId}`);

      // Emit real-time notification to the user via Socket.io
      ioServer.to(userId.toString()).emit('reportReady', {
        reportId: jobId,
        generatedAt: reportData.generatedAt,
      });
    } catch (error: any) {
      logger.error(`Error processing analytics job ${job.id} for user ${userId}:`, error.message);

      // Emit failure notification to the user
      ioServer.to(userId.toString()).emit('reportFailed', {
        reportId: jobId,
        message: error.message || 'Report generation failed.',
      });

      // Rethrow the error to let BullMQ handle retries based on job options
      throw error;
    }
  },
  { connection }
);

// Handle worker errors
analyticsWorker.on('error', (err) => {
  logger.error('Analytics Worker encountered an error:', err);
});

// Optional: Listen for completed jobs
analyticsWorker.on('completed', (job) => {
  logger.info(`Analytics job ${job.id} completed successfully`);
});

// Optional: Listen for failed jobs
analyticsWorker.on('failed', (job, err) => {
  logger.error(`Analytics job ${job?.id} failed with error:`, err.message);
});

export default analyticsWorker;
