import express, { Express } from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import httpStatus from 'http-status';
import cookieParser from 'cookie-parser';
import path from 'path';
import session from 'express-session';
import config from './config/config';
import { logger, morgan } from './modules/logger';
import { authLimiter } from './modules/utils';
import { ApiError, errorConverter, errorHandler } from './modules/errors';
import routes from './routes/v1';
import { passport } from './modules/auth';

const app: Express = express();
// Define the path to the upload directory
const uploadDirectory = path.resolve(config.storage.LOCAL_UPLOAD_PATH);

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Serve static files from the uploads directory
app.use(`/${config.storage.LOCAL_UPLOAD_PATH}`, express.static(uploadDirectory));

// parse cookies
app.use(cookieParser(config.jwt.cookieOptions.name));

// set security HTTP headers
app.use(helmet());

// enable cors
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Session Middleware for storing state parameter
app.use(
  session({
    secret: config.session.SECRET, // Use a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: config.env === 'production' }, // Set to true if using HTTPS
  })
);
app.options('*', cors());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(ExpressMongoSanitize());

// gzip compression
app.use(compression());

// jwt authentication
app.use(passport.initialize());
app.use(passport.session());

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
