import Joi from 'joi';
import 'dotenv/config';

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    CLIENT_URL: Joi.string().required().description('Client url'),
    AWS_ACCESS_KEY_ID: Joi.string().required().description('AWS access key id'),
    AWS_SECRET_ACCESS_KEY: Joi.string().required().description('AWS access key id'),
    AWS_REGION: Joi.string().required().description('AWS region'),
    AWS_BUCKET_NAME: Joi.string().required().description('AWS bucket name'),
    COOKIE_SECRET: Joi.string().required().description('Cookie secret'),
    LOCAL_UPLOAD_PATH: Joi.string().required().description('Local upload path'),
    CLOUDINARY_CLOUD_NAME: Joi.string().required().description('Cloudinary cloud name'),
    CLOUDINARY_API_KEY: Joi.string().required().description('Cloudinary api key'),
    CLOUDINARY_API_SECRET: Joi.string().required().description('Cloudinary api secret'),
    GOOGLE_CLIENT_ID: Joi.string().required().description('Google client id'),
    GOOGLE_CLIENT_SECRET: Joi.string().required().description('Google Client Secret'),
    GOOGLE_CALLBACK_URI: Joi.string().required().description('Google callback uri'),
    SESSION_SECRET: Joi.string().required().description('Session secret'),
    INSTAGRAM_APP_ID: Joi.string().required().description('Instagram client id'),
    INSTAGRAM_APP_SECRET: Joi.string().required().description('Instagram client secret'),
    INSTAGRAM_REDIRECT_URI: Joi.string().required().description('Instagram redirect uri'),
    INSTGRAM_GRAPH_URL: Joi.string().required().description('Instagram graph url'),
    BACKEND_URL: Joi.string().required().description('Backend url'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  backendURL: envVars.BACKEND_URL,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    cookieOptions: {
      httpOnly: true,
      secure: envVars.NODE_ENV === 'production',
      signed: true,
      name: envVars.COOKIE_SECRET,
    },
  },
  clientUrl: envVars.CLIENT_URL,
  storage: {
    AWS_ACCESS_KEY_ID: envVars.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: envVars.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: envVars.AWS_REGION,
    AWS_BUCKET_NAME: envVars.AWS_BUCKET_NAME,
    LOCAL_UPLOAD_PATH: envVars.LOCAL_UPLOAD_PATH,
    CLOUDINARY_CLOUD_NAME: envVars.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: envVars.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: envVars.CLOUDINARY_API_SECRET,
  },
  google: {
    GOOGLE_CLIENT_ID: envVars.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: envVars.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URI: envVars.GOOGLE_CALLBACK_URI,
  },
  session: {
    SECRET: envVars.SESSION_SECRET,
  },
  instagram: {
    INSTAGRAM_APP_ID: envVars.INSTAGRAM_APP_ID,
    INSTAGRAM_APP_SECRET: envVars.INSTAGRAM_APP_SECRET,
    INSTAGRAM_REDIRECT_URI: envVars.INSTAGRAM_REDIRECT_URI,
    INSTGRAM_GRAPH_URL: envVars.INSTGRAM_GRAPH_URL,
  },
};

export default config;
