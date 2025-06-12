"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reservations_service_1 = require("./reservations.service");
const reservations_controller_1 = require("./reservations.controller");
const reservation_entity_1 = require("./entities/reservation.entity");
const court_entity_1 = require("../courts/entities/court.entity");
const user_entity_1 = require("../users/entities/user.entity");
const player_entity_1 = require("./entities/player.entity");
const email_module_1 = require("../email/email.module");
let ReservationsModule = class ReservationsModule {
};
exports.ReservationsModule = ReservationsModule;
exports.ReservationsModule = ReservationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([reservation_entity_1.Reservation, court_entity_1.Court, user_entity_1.User, player_entity_1.Player]),
            email_module_1.EmailModule,
        ],
        providers: [reservations_service_1.ReservationsService],
        controllers: [reservations_controller_1.ReservationsController],
        exports: [reservations_service_1.ReservationsService],
    })
], ReservationsModule);
//# sourceMappingURL=reservations.module.js.map