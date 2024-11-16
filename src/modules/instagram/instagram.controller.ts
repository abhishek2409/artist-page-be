/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import axios from 'axios';
import { ApiError } from '../errors';
import * as instagramService from './instagram.service';
import { catchAsync } from '../utils';
import { logger } from '../logger';
import config from '../../config/config';
import InstagramAccount from './instagram.model';
import { userService } from '../user';

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

export const instagramCallback = catchAsync(async (req: Request, res: Response) => {
  const { code, error, error_reason, error_description } = req.query;

  if (error || error_reason || error_description) {
    logger.error('Error:', error, error_reason, error_description);
    return res.status(400).json({ message: `Error: ${error_description}` });
  }

  if (!code || typeof code !== 'string') {
    logger.error('Invalid authorization code.');
    return res.status(400).json({ message: 'Invalid authorization code.' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://api.instagram.com/oauth/access_token',
      new URLSearchParams({
        client_id: config.instagram.INSTAGRAM_APP_ID,
        client_secret: config.instagram.INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: config.instagram.INSTAGRAM_REDIRECT_URI,
        code,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    logger.info('Access token response:', tokenResponse.data);

    const { access_token, user_id } = tokenResponse.data;

    const longLivedTokenResponse = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: config.instagram.INSTAGRAM_APP_SECRET,
        access_token,
      },
    });

    logger.info('Long-lived access token response:', longLivedTokenResponse.data);

    const { expires_in, access_token: longLivedAccessToken } = longLivedTokenResponse.data;

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const existingAccount = await InstagramAccount.findOne({ userId });
    logger.info('existingAccount', existingAccount);
    if (existingAccount) {
      existingAccount.accessToken = longLivedAccessToken;
      existingAccount.instagramUserId = user_id;
      existingAccount.expiresIn = expires_in;
      await existingAccount.save();
    } else {
      const newAccount = new InstagramAccount({
        userId,
        accessToken: longLivedAccessToken,
        instagramUserId: user_id,
        expiresIn: expires_in,
      });
      await newAccount.save();
    }
    await userService.updateUserById(userId, { isInstagramConnected: true });
    return res.redirect(`${config.clientUrl}/social-media?success=true`);
  } catch (err) {
    logger.info('Error exchanging code for access token:', err);
    return res.redirect(`${config.clientUrl}/social-media?error=true`);
  }
});
