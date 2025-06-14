"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const forgot_password_controller_1 = require("../auth/forgot-password.controller");
const forgot_password_service_1 = require("./services/forgot-password.service");
const password_reset_entities_1 = require("../auth/entities/password-reset.entities");
const user_entity_1 = require("../users/entities/user.entity");
const users_module_1 = require("../users/users.module");
const jwt_1 = require("@nestjs/jwt");
const jwt_constants_1 = require("./constants/jwt.constants");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_strategy_1 = require("./strategy/jwt.strategy");
const email_service_1 = require("../email/email.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            typeorm_1.TypeOrmModule.forFeature([password_reset_entities_1.PasswordResetToken, user_entity_1.User]),
            jwt_1.JwtModule.register({
                global: true,
                secret: jwt_constants_1.jwtConstanst.secret,
                signOptions: { expiresIn: '1d' },
            }),
        ],
        controllers: [auth_controller_1.AuthController, forgot_password_controller_1.ForgotPasswordController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, forgot_password_service_1.ForgotPasswordService, email_service_1.EmailService],
        exports: [auth_service_1.AuthService, jwt_1.JwtModule, jwt_strategy_1.JwtStrategy, forgot_password_service_1.ForgotPasswordService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map