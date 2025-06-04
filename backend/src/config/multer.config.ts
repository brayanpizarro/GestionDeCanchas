import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads';
      // Create folder if doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueFilename = `${uuid()}${extname(file.originalname)}`;
      cb(null, uniqueFilename);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(new HttpException('Formato de archivo no soportado', HttpStatus.BAD_REQUEST), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
