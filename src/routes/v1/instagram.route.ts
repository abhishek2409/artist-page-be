/* eslint-disable @typescript-eslint/naming-convention */
// routes/instagramAuth.ts
import express, { Request, Response } from 'express';
import { auth } from '../../modules/auth';
import config from '../../config/config';
import { instagramController } from '../../modules/instagram';

const router = express.Router();

router.get('/connect', auth(), (_req: Request, res: Response) => {
  const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=${
    config.instagram.INSTAGRAM_APP_ID
  }&redirect_uri=${encodeURIComponent(config.instagram.INSTAGRAM_REDIRECT_URI!)}&scope=${encodeURIComponent(
    'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish'
  )}&response_type=code`;
  res.redirect(instagramAuthUrl);
});

router.get('/callback', auth(), instagramController.instagramCallback);

router.get('/posts', auth(), instagramController.getInstagramMediaIds);

router.get('/post/:id', auth(), instagramController.getInstagramMedia);

export default router;
