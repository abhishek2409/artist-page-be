/* eslint-disable no-nested-ternary */
/* eslint-disable import/prefer-default-export */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../config/config';
import { ApiError } from '../errors';

// Define the path to the upload directory
const uploadDirectory = path.resolve(config.storage.LOCAL_UPLOAD_PATH);

// Ensure the upload directory exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure Multer storage options
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory); // Define the directory for file storage
  },
  filename: (req, file, cb) => {
    const title = req.body.title.replace(/\s+/g, '-').toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const fileName = `${title}-${date}-${uniqueId}${extension}`;
    cb(null, fileName);
  },
});

// Middleware function to handle media upload
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new ApiError(httpStatus.BAD_REQUEST, 'Invalid file type. Only images and videos are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // File size limit of 2 MB
}).single('media');

export const uploadMedia = (req: Request, res: Response): Promise<{ fileURL: string; fileType: string }> => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return reject(new ApiError(httpStatus.BAD_REQUEST, 'File too large. Maximum size is 5MB.'));
        }
        return reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unable to upload hero media'));
      }

      const relativePath = `/${config.storage.LOCAL_UPLOAD_PATH}${req.file?.filename}`;
      const fileURL = `http://localhost:5000${relativePath}`;
      const mimeType = req.file?.mimetype || '';
      const fileType = mimeType.startsWith('image/') ? 'image' : mimeType.startsWith('video/') ? 'video' : '';

      resolve({ fileURL, fileType });
    });
  });
};
