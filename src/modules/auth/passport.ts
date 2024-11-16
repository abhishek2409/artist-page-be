import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import passport from 'passport';
import { Request } from 'express';
import tokenTypes from '../token/token.types';
import config from '../../config/config';
import User from '../user/user.model';
import { IPayload } from '../token/token.interfaces';
import { logger } from '../logger';
import { userService } from '../user';
import { IUser, Provider } from '../user/user.interfaces';

interface OAuthState {
  csrf: string;
  flow: 'login' | 'signup';
}

// Custom extractor to get token from cookie
const cookieExtractor = (req: any): string | null => {
  let token = null;
  if (req && req.cookies) {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    token = req.cookies['artist_page_token_access'];
  }
  return token;
};

// Combine multiple extractors
const jwtExtractor = (req: any) => {
  return (
    ExtractJwt.fromAuthHeaderAsBearerToken()(req) || // Extract from Authorization header
    cookieExtractor(req) // Extract from cookie
  );
};

passport.use(
  new JwtStrategy(
    {
      secretOrKey: config.jwt.secret,
      jwtFromRequest: jwtExtractor,
    },
    async (payload: IPayload, done) => {
      try {
        if (payload.type !== tokenTypes.ACCESS) {
          throw new Error('Invalid token type');
        }
        const user = await User.findById(payload.sub);
        if (!user) {
          return done(null, false);
        }
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.GOOGLE_CLIENT_ID,
      clientSecret: config.google.GOOGLE_CLIENT_SECRET,
      callbackURL: config.google.GOOGLE_CALLBACK_URI, // Unified callback URL
      passReqToCallback: true,
    },
    async (req: Request, _accessToken: string, _refreshToken: string, profile: Profile, done) => {
      try {
        const { state } = req.query;

        const stateObj: OAuthState = state ? JSON.parse(state as string) : {};

        // Validate CSRF token
        if (stateObj.csrf !== req.session.oauthState) {
          logger.info('Invalid CSRF token.');
          return done(null, false, { message: 'Invalid CSRF token.' });
        }

        // Clear the stored state
        delete req.session.oauthState;

        const email = profile?.emails?.[0]?.value.toLowerCase();
        const existingUser = await User.findOne({ email });
        logger.info('User found', existingUser);

        if (stateObj.flow === 'login') {
          if (!existingUser) {
            // User does not exist; cannot log in
            logger.info('User does not exist');
            return done(null, false, { message: 'User does not exist. Please sign up first.' });
          }
          if (existingUser.provider !== 'google') {
            // User exists but registered via different provider
            logger.info('Email already registered with a different provider');
            return done(null, false, { message: 'Email already registered with a different provider.' });
          }
          // Successful login
          return done(null, existingUser);
        }
        if (stateObj.flow === 'signup') {
          if (existingUser) {
            // User already exists; cannot sign up
            logger.info('User already exists');
            return done(null, false, { message: 'User already exists. Please log in.' });
          }
          // Create new user

          if (email) {
            const newUser: IUser = {
              name: profile.displayName,
              email,
              provider: Provider.GOOGLE,
              googleId: profile.id,
              isEmailVerified: true,
              password: 'TEMP',
              role: 'user',
            };
            const user = await userService.registerUser(newUser);
            logger.info('User created successfully', newUser);
            return done(null, user);
          }
          return done('Email not found', false, { message: 'Email not found.' });
        }
        // Invalid state
        logger.info('Invalid authentication state');
        return done(null, false, { message: 'Invalid authentication state.' });
      } catch (error) {
        done(error, false);
      }
    }
  )
);

// Serialize and Deserialize (if using sessions; optional for JWT)
// passport.serializeUser((user: any, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id: string, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

export default passport;
