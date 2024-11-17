/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';
import mongoose, { UpdateQuery } from 'mongoose';
import httpStatus from 'http-status';
import { IInstagramAccount, InstagramMedia } from './instagram.interfaces';
import InstagramAccount from './instagram.model';
import config from '../../config/config';
import { logger } from '../logger';
import { userService } from '../user';
import { isCreatedAtPlus60DaysLessThanOneDayFromToday } from '../utils/date';
import { ApiError } from '../errors';
import { UserInsights } from '../analytics/analytics.interfaces';

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

export const fetchUserInsights = async (userId: mongoose.Types.ObjectId): Promise<UserInsights> => {
  const account: IInstagramAccount | null = await InstagramAccount.findOne({ userId });

  if (!account) {
    throw new Error('Instagram account not connected.');
  }

  try {
    const insightsResponse = await axios.get(`${config.instagram.INSTGRAM_GRAPH_URL}/${account.instagramUserId}/insights`, {
      params: {
        access_token: account.accessToken,
        metrics:
          'impressions,reach,total_interactions,accounts_engaged,likes,comments,saved,shares,replies,profile_views,website_clicks,profile_links_taps,follows_and_unfollows,engaged_audience_demographics,reached_audience_demographics,follower_demographics',
      },
    });
    logger.info('Insights Response', insightsResponse.data);
    const { data } = insightsResponse.data;
    const userInsights: UserInsights = {
      impressions: 0,
      reach: 0,
      totalInteractions: 0,
      accountsEngaged: 0,
      likes: 0,
      comments: 0,
      saved: 0,
      shares: 0,
      replies: 0,
      profileViews: 0,
      websiteClicks: 0,
      profileLinksTaps: 0,
      followsAndUnfollows: 0,
      engagedAudienceDemographics: 0,
      reachedAudienceDemographics: 0,
      followerDemographics: 0,
      generatedAt: new Date(),
    };
    // parse insights data
    data.forEach((insight: any) => {
      switch (insight.name) {
        case 'impressions':
          userInsights.impressions = insight.values[0].value;
          break;
        case 'reach':
          userInsights.reach = insight.values[0].value;
          break;
        case 'total_interactions':
          userInsights.totalInteractions = insight.values[0].value;
          break;
        case 'accounts_engaged':
          userInsights.accountsEngaged = insight.values[0].value;
          break;
        case 'likes':
          userInsights.likes = insight.values[0].value;
          break;
        case 'comments':
          userInsights.comments = insight.values[0].value;
          break;
        case 'saved':
          userInsights.saved = insight.values[0].value;
          break;
        case 'shares':
          userInsights.shares = insight.values[0].value;
          break;
        case 'replies':
          userInsights.replies = insight.values[0].value;
          break;
        case 'profile_views':
          userInsights.profileViews = insight.values[0].value;
          break;
        case 'website_clicks':
          userInsights.websiteClicks = insight.values[0].value;
          break;
        case 'profile_links_taps':
          userInsights.profileLinksTaps = insight.values[0].value;
          break;
        case 'follows_and_unfollows':
          userInsights.followsAndUnfollows = insight.values[0].value;
          break;
        case 'engaged_audience_demographics':
          userInsights.engagedAudienceDemographics = insight.values[0].value;
          break;
        case 'reached_audience_demographics':
          userInsights.reachedAudienceDemographics = insight.values[0].value;
          break;
        case 'follower_demographics':
          userInsights.followerDemographics = insight.values[0].value;
          break;
        default:
          break;
      }
    });

    return userInsights;
  } catch (error) {
    logger.error('Error fetching Instagram insights:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Inetrnal server error, please refresh page');
  }
};
