/* eslint-disable no-param-reassign */
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import httpStatus from 'http-status';
import { Socket } from 'socket.io';
import ApiError from '../errors/ApiError';
import { roleRights } from '../../config/roles';
import { IUserDoc } from '../user/user.interfaces';
import { logger } from '../logger';
import { authenticateUser } from './auth.utils';

const verifyCallback =
  (req: Request, resolve: any, reject: any, requiredRights: string[]) =>
  async (err: Error, user: IUserDoc, info: string) => {
    logger.info('err:', err, 'user:', user, 'info:', info);
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      if (!userRights) return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      const hasRequiredRights = requiredRights.every((requiredRight: string) => userRights.includes(requiredRight));
      if (!hasRequiredRights && req.params['userId'] !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }

    resolve();
  };

// backend/src/middleware/authenticateSocket.ts

/**
 * Socket.io middleware for authenticating users.
 * @param socket - Socket.io socket instance.
 * @param next - Callback to proceed or pass an error.
 */
export const authenticateSocket = async (socket: Socket, next: NextFunction) => {
  try {
    const { token } = socket.handshake.auth;

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication token is missing');
    }

    // Authenticate user
    const user = await authenticateUser(token);

    // Attach user to socket instance
    socket.data.user = user;

    next();
  } catch (error: any) {
    logger.error('Socket authentication error:', error);
    next(new Error(error.message || 'Authentication error'));
  }
};

const authMiddleware =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) =>
    new Promise<void>((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));

export default authMiddleware;
