"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const fs_1 = require("fs");
const multer_1 = require("multer");
const uuid_1 = require("uuid");
const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
exports.multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            const uploadPath = './uploads';
            if (!(0, fs_1.existsSync)(uploadPath)) {
                (0, fs_1.mkdirSync)(uploadPath);
            }
            cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
            const filename = `${(0, uuid_1.v4)()}-${file.originalname}`;
            cb(null, filename);
        },
    }),
    fileFilter: (_req, file, cb) => {
        if (validMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type, only PNG and JPG are allowed'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};
//# sourceMappingURL=multer.config.js.map