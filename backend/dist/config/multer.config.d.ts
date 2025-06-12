import { Request } from 'express';
export declare const multerConfig: {
    storage: import("multer").StorageEngine;
    fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => void;
    limits: {
        fileSize: number;
    };
};
