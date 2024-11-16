// services/instagramService.ts
import axios from 'axios';
import mongoose from 'mongoose';
import { IInstagramAccount } from './instagram.interfaces';
import InstagramAccount from './instagram.model';
import config from '../../config/config';
import { logger } from '../logger';

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

export const fetchInstagramMediaIds = async (userId: mongoose.Types.ObjectId): Promise<Partial<InstagramMedia>[]> => {
  const account: IInstagramAccount | null = await InstagramAccount.findOne({ userId });

  if (!account) {
    throw new Error('Instagram account not connected.');
  }

  // Note: Instagram Basic Display API uses long-lived tokens (valid for 60 days)
  // If you're using short-lived tokens, implement token refreshing here

  const mediaResponse = await axios.get(`${config.instagram.INSTGRAM_GRAPH_URL}/${account.instagramUserId}/media`, {
    params: {
      access_token: account.accessToken,
    },
  });
  logger.info('Media Response', mediaResponse.data);
  const { data } = mediaResponse.data;

  return data;
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
