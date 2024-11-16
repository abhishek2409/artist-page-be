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
