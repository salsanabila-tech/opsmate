import multer from 'multer';

import { AppError } from '../errors/app-error.js';

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

const allowedDeclaredMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const uploadWorkOrderAttachment = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: MAX_ATTACHMENT_SIZE,
  },

  fileFilter: (_request, file, callback) => {
    if (!allowedDeclaredMimeTypes.has(file.mimetype)) {
      callback(new AppError(415, 'File attachment harus berupa JPEG, PNG, atau WEBP', 'UNSUPPORTED_ATTACHMENT_FILE_TYPE'));

      return;
    }

    callback(null, true);
  },
}).single('file');
