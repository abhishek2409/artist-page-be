import mongoose, { Document } from 'mongoose';

export interface IInstagramAccount extends Document {
  userId: mongoose.Types.ObjectId;
  instagramUserId: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  createdAt: Date;
  updatedAt: Date;
}

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
