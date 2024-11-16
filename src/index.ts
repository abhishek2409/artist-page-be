import mongoose from 'mongoose';
import https from 'https';
import fs from 'fs';
import path from 'path';
import app from './app';
import config from './config/config';
import logger from './modules/logger/logger';

let server: any;
mongoose.connect(config.mongoose.url).then(() => {
  logger.info('Connected to MongoDB');
  server = https
    .createServer(
      {
        key: fs.readFileSync(path.resolve('./server.key')),
        cert: fs.readFileSync(path.resolve('./server.crt')),
      },
      app
    )
    .listen(config.port, () => {
      logger.info(`HTTPS Server running on https://localhost:${config.port}`);
    });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: string) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
