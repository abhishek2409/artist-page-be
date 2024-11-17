/* eslint-disable import/prefer-default-export */
// backend/src/utils/authUtils.ts

import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { logger } from '../logger';
import { IUserDoc } from '../user/user.interfaces';
import User from '../user/user.model';
import { verifyToken } from '../token/token.service';
import { tokenTypes } from '../token';

/**
 * Authenticates a user based on a JWT token.
 * @param token - JWT token string.
 * @param requiredRights - Array of required rights for authorization.
 * @returns The authenticated user.
 * @throws ApiError if authentication or authorization fails.
 */
export const authenticateUser = async (token: string): Promise<IUserDoc> => {
  try {
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication token is missing');
    }

    const tokenDoc = await verifyToken(token, tokenTypes.ACCESS);

    // Fetch user from the database
    const user = await User.findById(tokenDoc.user);

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
    }

    return user;
  } catch (error: any) {
    logger.error('Authentication error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid authentication token');
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication failed');
  }
};
