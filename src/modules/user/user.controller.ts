import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import * as userService from './user.service';

// eslint-disable-next-line import/prefer-default-export
export const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(new mongoose.Types.ObjectId(req.user._id));
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});
