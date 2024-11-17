import mongoose, { Document } from 'mongoose';

export interface UserInsights {
  // interactions metrics
  impressions: number;
  reach: number;
  totalInteractions: number;
  accountsEngaged: number;
  likes: number;
  comments: number;
  saved: number;
  shares: number;
  replies: number;
  profileViews: number;
  websiteClicks: number;
  profileLinksTaps: number;
  followsAndUnfollows: number;
  // demographic metrics
  engagedAudienceDemographics: number;
  reachedAudienceDemographics: number;
  followerDemographics: number;
  generatedAt: Date;
}

export interface IReportDoc extends Document {
  userId: mongoose.Types.ObjectId;
  reportId: string;
  reportData: UserInsights;
  generatedAt: Date;
}
