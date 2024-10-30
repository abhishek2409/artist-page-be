/* eslint-disable no-console */
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { catchAsync } from '../utils';
import { uploadMedia } from '../media/media.service';
import { ApiError } from '../errors';
import * as heroService from './hero.service';

// eslint-disable-next-line import/prefer-default-export
export const createHero = catchAsync(async (req: Request, res: Response) => {
  try {
    const { fileType, fileURL } = await uploadMedia(req, res);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const heroSection = await heroService.createHero({ ...req.body, mediaURL: fileURL, mediaType: fileType, userId });
    res.status(httpStatus.CREATED).send({ heroSection });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unable to create hero');
  }
});

export const getAllHeros = catchAsync(async (req: Request, res: Response) => {
  const hero = await heroService.getAllHeros(new mongoose.Types.ObjectId(req.user._id));
  if (!hero) {
    throw new ApiError(httpStatus.NO_CONTENT, 'No Hero Found');
  }
  res.send(hero);
});
