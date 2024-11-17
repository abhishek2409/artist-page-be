import mongoose, { Schema } from 'mongoose';
import { IReportDoc } from './analytics.interfaces';

const ReportSchema = new Schema<IReportDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportId: { type: String, required: true, unique: true },
    reportData: {
      impressions: { type: Number, required: true },
      reach: { type: Number, required: true },
      totalInteractions: { type: Number, required: true },
      accountsEngaged: { type: Number, required: true },
      likes: { type: Number, required: true },
      comments: { type: Number, required: true },
      saved: { type: Number, required: true },
      shares: { type: Number, required: true },
      replies: { type: Number, required: true },
      profileViews: { type: Number, required: true },
      websiteClicks: { type: Number, required: true },
      profileLinksTaps: { type: Number, required: true },
      followsAndUnfollows: { type: Number, required: true },
      engagedAudienceDemographics: { type: Number, required: true },
      reachedAudienceDemographics: { type: Number, required: true },
      followerDemographics: { type: Number, required: true },
      generatedAt: { type: Date, required: true },
    },
    generatedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IReportDoc>('Report', ReportSchema);
