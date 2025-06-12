"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const forgot_password_service_1 = require("../auth/services/forgot-password.service");
const forgot_password_dto_1 = require("../auth/dto/forgot-password.dto");
let ForgotPasswordController = class ForgotPasswordController {
    forgotPasswordService;
    constructor(forgotPasswordService) {
        this.forgotPasswordService = forgotPasswordService;
    }
    async requestPasswordReset(forgotPasswordDto) {
        console.log('getting request');
        return await this.forgotPasswordService.requestPasswordReset(forgotPasswordDto.email);
    }
    async verifyResetCode(verifyResetCodeDto) {
        return await this.forgotPasswordService.verifyResetCode(verifyResetCodeDto.email, verifyResetCodeDto.code);
    }
    async resetPassword(resetPasswordDto) {
        return await this.forgotPasswordService.resetPassword(resetPasswordDto.email, resetPasswordDto.code, resetPasswordDto.newPassword);
    }
};
exports.ForgotPasswordController = ForgotPasswordController;
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Solicitar código de restablecimiento de contraseña',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Código enviado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], ForgotPasswordController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)('verify-reset-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar código de restablecimiento' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Código verificado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Código inválido o expirado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.VerifyResetCodeDto]),
    __metadata("design:returntype", Promise)
], ForgotPasswordController.prototype, "verifyResetCode", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restablecer contraseña' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Contraseña actualizada exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Código inválido o datos incorrectos',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], ForgotPasswordController.prototype, "resetPassword", null);
exports.ForgotPasswordController = ForgotPasswordController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [forgot_password_service_1.ForgotPasswordService])
], ForgotPasswordController);
//# sourceMappingURL=forgot-password.controller.js.map