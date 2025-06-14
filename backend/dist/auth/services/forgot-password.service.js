"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const password_reset_entities_1 = require("../entities/password-reset.entities");
const user_entity_1 = require("../../users/entities/user.entity");
const email_service_1 = require("../../email/email.service");
let ForgotPasswordService = class ForgotPasswordService {
    passwordResetTokenRepository;
    userRepository;
    emailService;
    constructor(passwordResetTokenRepository, userRepository, emailService) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
    async requestPasswordReset(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            return {
                message: 'Si el correo existe, recibirás un código de verificación',
            };
        }
        await this.cleanupExpiredTokens();
        await this.passwordResetTokenRepository.delete({ email, isUsed: false });
        const code = this.generateSixDigitCode();
        const token = crypto.randomBytes(32).toString('hex');
        const hashedCode = await bcrypt.hash(code, 10);
        const resetToken = this.passwordResetTokenRepository.create({
            email,
            code: hashedCode,
            token,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });
        await this.passwordResetTokenRepository.save(resetToken);
        await this.emailService.sendPasswordResetCode(email, code, user.name || 'Usuario');
        return {
            message: 'Si el correo existe, recibirás un código de verificación',
        };
    }
    async verifyResetCode(email, code) {
        const resetToken = await this.passwordResetTokenRepository.findOne({
            where: {
                email,
                isUsed: false,
            },
            order: { createdAt: 'DESC' },
        });
        if (!resetToken) {
            throw new common_1.BadRequestException('Código inválido o expirado');
        }
        if (resetToken.expiresAt < new Date()) {
            await this.passwordResetTokenRepository.delete({ id: resetToken.id });
            throw new common_1.BadRequestException('El código ha expirado');
        }
        const isValidCode = await bcrypt.compare(code, resetToken.code);
        if (!isValidCode) {
            throw new common_1.BadRequestException('Código inválido');
        }
        return { message: 'Código verificado correctamente', valid: true };
    }
    async resetPassword(email, code, newPassword) {
        const resetToken = await this.passwordResetTokenRepository.findOne({
            where: {
                email,
                isUsed: false,
            },
            order: { createdAt: 'DESC' },
        });
        if (!resetToken) {
            throw new common_1.BadRequestException('Código inválido o expirado');
        }
        if (resetToken.expiresAt < new Date()) {
            await this.passwordResetTokenRepository.delete({ id: resetToken.id });
            throw new common_1.BadRequestException('El código ha expirado');
        }
        const isValidCode = await bcrypt.compare(code, resetToken.code);
        if (!isValidCode) {
            throw new common_1.BadRequestException('Código inválido');
        }
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await this.userRepository.update({ email }, {
            password: hashedPassword,
            updatedAt: new Date(),
        });
        await this.passwordResetTokenRepository.update({ id: resetToken.id }, { isUsed: true });
        await this.emailService.sendPasswordResetConfirmation(email, user.name || 'Usuario');
        return { message: 'Contraseña actualizada correctamente' };
    }
    async cleanupExpiredTokens() {
        await this.passwordResetTokenRepository.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date()),
        });
    }
    generateSixDigitCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};
exports.ForgotPasswordService = ForgotPasswordService;
exports.ForgotPasswordService = ForgotPasswordService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(password_reset_entities_1.PasswordResetToken)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], ForgotPasswordService);
//# sourceMappingURL=forgot-password.service.js.map