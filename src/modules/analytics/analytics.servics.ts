/* eslint-disable import/prefer-default-export */
// backend/src/services/analyticsService.ts

import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import analyticsQueue from './analytics.queue';

/**
 * Enqueues a new analytics report generation job.
 * @param userId - ID of the user requesting the report.
 * @returns The job ID.
 */
export const enqueueAnalyticsJob = async (userId: mongoose.Types.ObjectId): Promise<string> => {
  const jobId = uuidv4();
  await analyticsQueue.add('generateReport', { jobId, attempts: 3, backoff: 5000, userId });
  return jobId;
};
