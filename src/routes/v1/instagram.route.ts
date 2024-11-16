/* eslint-disable @typescript-eslint/naming-convention */
// routes/instagramAuth.ts
import express, { Request, Response } from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import { auth } from '../../modules/auth';
import config from '../../config/config';
import { catchAsync } from '../../modules/utils';
import { logger } from '../../modules/logger';
import InstagramAccount from '../../modules/instagram/instagram.model';
import { userService } from '../../modules/user';
import { instagramController } from '../../modules/instagram';

const router = express.Router();

// Step 1: Redirect user to Instagram for authentication
router.get('/connect', auth(), (_req: Request, res: Response) => {
  const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=${
    config.instagram.INSTAGRAM_APP_ID
  }&redirect_uri=${encodeURIComponent(config.instagram.INSTAGRAM_REDIRECT_URI!)}&scope=${encodeURIComponent(
    'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish'
  )}&response_type=code`;
  res.redirect(instagramAuthUrl);
});

router.get(
  '/callback',
  auth(),
  catchAsync(async (req: Request, res: Response) => {
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
          accessToken: access_token,
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
  })
);

router.get('/posts', auth(), instagramController.getInstagramMediaIds);

router.get('/post/:id', auth(), instagramController.getInstagramMedia);

export default router;
