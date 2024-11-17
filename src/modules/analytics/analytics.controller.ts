/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { catchAsync } from '../utils';
import Report from './analytics.model';
import { ApiError } from '../errors';
import { enqueueAnalyticsJob } from './analytics.servics';
import InstagramAccount from '../instagram/instagram.model';

export const generateReport = catchAsync(async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    // Ensure the user has connected their Instagram account
    const instagramAccount = await InstagramAccount.findOne({ userId });
    if (!instagramAccount) {
      return res.status(400).json({ message: 'Instagram account not connected.' });
    }
    const jobId = await enqueueAnalyticsJob(userId);
    res.status(202).json({ message: 'Analytics report generation started.', jobId });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to initiate analytics report generation.' });
  }
});

export const getReportDetail = catchAsync(async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { reportId } = req.params;

    const report = await Report.findOne({ reportId, userId });

    if (!report) {
      throw new ApiError(httpStatus.NO_CONTENT, 'No Report Found');
    }
    return res.send({ report });
  } catch (error: any) {
    return new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Failed to retrieve report.');
  }
});
