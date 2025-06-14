import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

const validMimeTypes = ['image/png', 'image/jpeg'];

export const multerConfig = {
  storage: diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      const uploadPath = './uploads';
      // Create folder if doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      // Limpiar el nombre original del archivo
      const cleanOriginalName = file.originalname
        .replace(/[^\w\s.-]/g, '') // Remover caracteres especiales excepto espacios, puntos y guiones
        .replace(/\s+/g, '-') // Reemplazar espacios con guiones
        .toLowerCase(); // Convertir a minúsculas
      
      // Generate unique filename
      const filename = `${uuidv4()}-${cleanOriginalName}`;
      cb(null, filename);
    },
  }),
  fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    if (validMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only PNG and JPG are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
