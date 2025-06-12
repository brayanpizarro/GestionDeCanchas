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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordDto = exports.VerifyResetCodeDto = exports.ForgotPasswordDto = void 0;
const class_validator_1 = require("class-validator");
class ForgotPasswordDto {
    email;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: "Debe ser un email válido" }),
    (0, class_validator_1.IsNotEmpty)({ message: "El email es requerido" }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class VerifyResetCodeDto {
    email;
    code;
}
exports.VerifyResetCodeDto = VerifyResetCodeDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: "Debe ser un email válido" }),
    (0, class_validator_1.IsNotEmpty)({ message: "El email es requerido" }),
    __metadata("design:type", String)
], VerifyResetCodeDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "El código debe ser una cadena de texto" }),
    (0, class_validator_1.IsNotEmpty)({ message: "El código es requerido" }),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: "El código debe tener exactamente 6 dígitos" }),
    __metadata("design:type", String)
], VerifyResetCodeDto.prototype, "code", void 0);
class ResetPasswordDto {
    email;
    code;
    newPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: "Debe ser un email válido" }),
    (0, class_validator_1.IsNotEmpty)({ message: "El email es requerido" }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "El código debe ser una cadena de texto" }),
    (0, class_validator_1.IsNotEmpty)({ message: "El código es requerido" }),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: "El código debe tener exactamente 6 dígitos" }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "La contraseña debe ser una cadena de texto" }),
    (0, class_validator_1.MinLength)(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, {
        message: "La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial",
    }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=forgot-password.dto.js.map