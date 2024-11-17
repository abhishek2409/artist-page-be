/* eslint-disable import/no-mutable-exports */
/* eslint-disable import/prefer-default-export */
import mongoose from 'mongoose';
import { Server as SocketIOServer, Socket } from 'socket.io';
import app, { server } from './app';
import config from './config/config';
import logger from './modules/logger/logger';
import { authenticateSocket } from './modules/auth/auth.middleware';

let ioServer: any;

mongoose.connect(config.mongoose.url).then(() => {
  logger.info('Connected to MongoDB');

  server.listen(config.port, () => {
    logger.info(`HTTPS Server running on https://localhost:${config.port}`);
  });
  ioServer = new SocketIOServer(server, {
    cors: {
      origin: config.clientUrl || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
});

ioServer.use(authenticateSocket);
app.set('socketio', ioServer);

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

// Handle Socket.io Connections
ioServer.on('connection', (socket: Socket) => {
  const { user } = socket.data;
  logger.info(`User connected: ${user.id}`);

  // Join a room specific to the user for targeted events
  socket.join(user.id.toString());

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${user.id}`);
  });
});

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

export { ioServer };
