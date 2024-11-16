/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { ApiError } from '../errors';
import * as instagramService from './instagram.service';
import { catchAsync } from '../utils';
import { logger } from '../logger';

export const getInstagramMediaIds = catchAsync(async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const instagramPosts = await instagramService.fetchInstagramMediaIds(userId);
    res.send({ instagramPosts });
  } catch (error: any) {
    logger.error(error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Unable to get Instagram Posts'
    );
  }
});
export const getInstagramMedia = catchAsync(async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const mediaId = req.params['id'] as string;
    const instagramPost = await instagramService.fetchInstagramMedia(userId, mediaId);
    res.send({ instagramPost });
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Unable to get Instagram Post'
    );
  }
});
