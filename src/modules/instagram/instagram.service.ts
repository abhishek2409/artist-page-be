/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';
import mongoose, { UpdateQuery } from 'mongoose';
import httpStatus from 'http-status';
import { IInstagramAccount } from './instagram.interfaces';
import InstagramAccount from './instagram.model';
import config from '../../config/config';
import { logger } from '../logger';
import { userService } from '../user';
import { isCreatedAtPlus60DaysLessThanOneDayFromToday } from '../utils/date';
import { ApiError } from '../errors';

export interface InstagramMedia {
  id: string;
  caption: string;
  media_type: 'CAROUSEL_ALBUM' | 'IMAGE' | 'VIDEO';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  username: string;
  comments_count: number;
  like_count: number;
  media_product_type: 'AD' | 'STORY' | 'REELS';
}
export const refreshAccessToken = async (userId: mongoose.Types.ObjectId): Promise<void> => {
  const account: IInstagramAccount | null = await InstagramAccount.findOne({ userId });

  if (!account) {
    throw new Error('Instagram account not connected.');
  }
  try {
    const longLivedTokenResponse = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: config.instagram.INSTAGRAM_APP_SECRET,
        access_token: account.accessToken,
      },
    });
    logger.info('Long-lived Token Response', longLivedTokenResponse.data);
    const { access_token, expires_in } = longLivedTokenResponse.data;

    await InstagramAccount.updateOne({ userId }, {
      $set: { accessToken: access_token, expiresIn: expires_in },
    } as UpdateQuery<IInstagramAccount>);
  } catch (error) {
    logger.error('Error refreshing access token:', error);
    await userService.updateUserById(userId, { isInstagramConnected: false });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Inetrnal server error, please refresh page');
  }
};

export const fetchInstagramMediaIds = async (userId: mongoose.Types.ObjectId): Promise<void> => {
  const account: IInstagramAccount | null = await InstagramAccount.findOne({ userId });

  if (!account) {
    throw new Error('Instagram account not connected.');
  }

  const { updatedAt } = account;

  if (isCreatedAtPlus60DaysLessThanOneDayFromToday(updatedAt)) {
    await refreshAccessToken(userId);
  }

  // Note: Instagram Basic Display API uses long-lived tokens (valid for 60 days)
  // If you're using short-lived tokens, implement token refreshing here
  try {
    const mediaResponse = await axios.get(`${config.instagram.INSTGRAM_GRAPH_URL}/${account.instagramUserId}/media`, {
      params: {
        access_token: account.accessToken,
      },
    });
    logger.info('Media Response', mediaResponse.data);
    const { data } = mediaResponse.data;
    return data;
  } catch (error) {
    logger.error('Error fetching Instagram media:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Inetrnal server error, please refresh page');
  }
};

export const fetchInstagramMedia = async (userId: mongoose.Types.ObjectId, mediaId: string): Promise<InstagramMedia> => {
  const account: IInstagramAccount | null = await InstagramAccount.findOne({ userId });

  if (!account) {
    throw new Error('Instagram account not connected.');
  }

  const mediaObject = await axios.get(`${config.instagram.INSTGRAM_GRAPH_URL}/${mediaId}`, {
    params: {
      fields:
        'caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,comments_count,like_count,media_product_type,id',
      access_token: account.accessToken,
    },
  });
  logger.info('Media Object', mediaObject.data);
  return mediaObject.data;
};
