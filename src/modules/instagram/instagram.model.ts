import mongoose, { Schema } from 'mongoose';
import { toJSON } from '../toJSON';
import { IInstagramAccount } from './instagram.interfaces';

const InstagramAccountSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    instagramUserId: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    expiresIn: { type: Number, required: true }, // Token expiry in seconds
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
InstagramAccountSchema.plugin(toJSON);

const InstagramAccount = mongoose.model<IInstagramAccount>('InstagramAccount', InstagramAccountSchema);

export default InstagramAccount;
