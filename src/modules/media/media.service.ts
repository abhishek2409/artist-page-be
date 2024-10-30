/* eslint-disable no-nested-ternary */
/* eslint-disable import/prefer-default-export */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import config from '../../config/config';

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
  limits: { fileSize: 2 * 1024 * 1024 }, // File size limit of 2 MB
}).single('media');

export const uploadMediaOld = (req: Request, res: Response): Promise<{ fileURL: string; fileType: string }> => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        return reject(err.message);
      }

      // Extract file path
      const filePath = req.file ? path.join(uploadDirectory, req.file.filename) : '';

      // Determine file type based on MIME type
      const mimeType = req.file?.mimetype || '';
      const fileType = mimeType.startsWith('image/') ? 'image' : mimeType.startsWith('video/') ? 'video' : '';

      if (!fileType) {
        return reject(new Error('Invalid file type. Only images and videos are allowed.'));
      }

      resolve({ fileURL: filePath, fileType });
    });
  });
};

export const uploadMedia = (req: Request, res: Response): Promise<{ fileURL: string; fileType: string }> => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        return reject(err.message);
      }

      const relativePath = `/${config.storage.LOCAL_UPLOAD_PATH}${req.file?.filename}`;
      const fileURL = `http://localhost:5000${relativePath}`;
      const mimeType = req.file?.mimetype || '';
      const fileType = mimeType.startsWith('image/') ? 'image' : mimeType.startsWith('video/') ? 'video' : '';

      if (!fileType) {
        return reject(new Error('Invalid file type. Only images and videos are allowed.'));
      }

      resolve({ fileURL, fileType });
    });
  });
};
