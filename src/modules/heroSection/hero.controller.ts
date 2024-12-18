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
    if (!fileType || !fileURL) throw new ApiError(httpStatus.BAD_REQUEST, 'Please upload a hero media');
    if (!req.body.title) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Please enter a title');
    }
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const heroSection = await heroService.createHero({ ...req.body, mediaURL: fileURL, mediaType: fileType, userId });
    res.status(httpStatus.CREATED).send({ hero: heroSection });
  } catch (error: any) {
    console.log({ error });
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Unable to create hero');
  }
});

export const updateHero = catchAsync(async (req: Request, res: Response) => {
  const heroId = new mongoose.Types.ObjectId(req.params['heroId']);
  const { fileType, fileURL } = await uploadMedia(req, res);
  let heroSection;
  if (!fileType) {
    heroSection = await heroService.updateHero(heroId, { ...req.body });
  } else {
    heroSection = await heroService.updateHero(heroId, { ...req.body, mediaURL: fileURL, mediaType: fileType });
  }
  res.send({ hero: heroSection });
});

export const getAllHeros = catchAsync(async (req: Request, res: Response) => {
  const hero = await heroService.getAllHeros(new mongoose.Types.ObjectId(req.user._id));
  if (!hero) {
    throw new ApiError(httpStatus.NO_CONTENT, 'No Hero Found');
  }
  res.send(hero);
});

export const getHero = catchAsync(async (req: Request, res: Response) => {
  const hero = await heroService.getOneHero(
    new mongoose.Types.ObjectId(req.params['id']),
    new mongoose.Types.ObjectId(req.user._id)
  );
  if (!hero) {
    throw new ApiError(httpStatus.NO_CONTENT, 'No Hero Found');
  }
  res.send(hero);
});

export const deleteHero = catchAsync(async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const heroId = new mongoose.Types.ObjectId(req.params['heroId']);

  const heros = await heroService.deleteOneHero(heroId, userId);
  res.send(heros);
});
