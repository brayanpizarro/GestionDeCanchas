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
exports.CardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const card_entity_1 = require("./entities/card.entity");
const card_validator_1 = require("./utils/card-validator");
let CardService = class CardService {
    cardRepository;
    constructor(cardRepository) {
        this.cardRepository = cardRepository;
    }
    async create(createCardDto, user) {
        const errors = (0, card_validator_1.validateCard)(createCardDto);
        if (errors.length > 0) {
            throw new common_1.BadRequestException(errors);
        }
        const expiry = `${createCardDto.expiryMonth.toString().padStart(2, '0')}/${createCardDto.expiryYear.toString().slice(-2)}`;
        const card = this.cardRepository.create({
            cardNumber: createCardDto.cardNumber,
            holderName: createCardDto.holderName,
            expiry,
            user
        });
        return this.cardRepository.save(card);
    }
    async findByUser(user) {
        return this.cardRepository.find({ where: { user } });
    }
    async remove(id, user) {
        const card = await this.cardRepository.findOne({ where: { id, user } });
        if (!card) {
            throw new Error('Tarjeta no encontrada o no pertenece al usuario.');
        }
        await this.cardRepository.remove(card);
    }
};
exports.CardService = CardService;
exports.CardService = CardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(card_entity_1.Card)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], CardService);
//# sourceMappingURL=card.service.js.map