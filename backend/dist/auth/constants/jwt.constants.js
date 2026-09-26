"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstanst = void 0;
exports.jwtConstanst = {
    secret: process.env.JWT_SECRET || (() => {
        throw new Error('JWT_SECRET debe estar configurado antes de iniciar el backend');
    })(),
};
//# sourceMappingURL=jwt.constants.js.map