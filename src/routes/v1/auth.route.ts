import express, { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { validate } from '../../modules/validate';
import { authValidation, authController } from '../../modules/auth';
import passport from '../../modules/auth/passport';
import config from '../../config/config';
import { tokenService } from '../../modules/token';
import { catchAsync } from '../../modules/utils';
import { logger } from '../../modules/logger';

const router: Router = express.Router();

// Social
router.route('/google/login').get(
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Generate a unique state parameter for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state; // Store state in session
    const flow = 'login'; // Define the flow
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: JSON.stringify({ csrf: state, flow }),
      session: false,
    })(req, res, next);
  })
);

router.route('/google/signup').get(
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Generate a unique state parameter for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state; // Store state in session
    const flow = 'signup'; // Define the flow
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: JSON.stringify({ csrf: state, flow }),
      session: false,
    })(req, res, next);
  })
);

router.get('/google/callback', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    // Extract flow from state
    const { state } = req.query;
    const stateObj = state ? JSON.parse(state as string) : {};
    const flow = stateObj.flow || 'login'; // Default to 'login' if not specified
    if (err) {
      logger.info('Authentication Error:', err);
      return res.redirect(
        `${config.clientUrl}/oauth-callback?error=true&message=${encodeURIComponent(err.message)}&flow=${flow}`
      );
    }
    if (!user) {
      // Authentication failed
      logger.info('Authentication failed:', info);
      const message = info?.message || 'Authentication failed.';
      return res.redirect(
        `${config.clientUrl}/oauth-callback?error=true&message=${encodeURIComponent(message)}&flow=${flow}`
      );
    }
    // Authentication successful
    try {
      logger.info('Authentication successful:');
      const tokens = await tokenService.generateAuthTokens({ id: user.id });

      res.redirect(`${config.clientUrl}/oauth-callback?success=true&token=${JSON.stringify(tokens)}&flow=${flow}`);
    } catch (error) {
      logger.error('Token Generation Error:', error);
      res.redirect(
        `${config.clientUrl}/oauth-callback?error=true&message=${encodeURIComponent('Token generation failed.')}`
      );
    }
  })(req, res, next);
});

router.post('/signup', validate(authValidation.signup), authController.signup);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);

export default router;
