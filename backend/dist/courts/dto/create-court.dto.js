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
exports.CreateCourtDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCourtDto {
    name;
    type;
    isCovered;
    imagePath;
    capacity;
    pricePerHour;
    status;
}
exports.CreateCourtDto = CreateCourtDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(['covered', 'uncovered'], {
        message: 'El tipo debe ser "covered" o "uncovered"'
    }),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === 'covered';
        }
        if (typeof value === 'boolean') {
            return value;
        }
        return false;
    }),
    __metadata("design:type", Boolean)
], CreateCourtDto.prototype, "isCovered", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "imagePath", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)({ message: 'La capacidad debe ser un número entero' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? undefined : parsed;
        }
        if (typeof value === 'number') {
            return value;
        }
        return undefined;
    }),
    __metadata("design:type", Number)
], CreateCourtDto.prototype, "capacity", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El precio por hora debe ser un número válido' }),
    (0, class_validator_1.Min)(0, { message: 'El precio por hora no puede ser negativo' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? undefined : parsed;
        }
        if (typeof value === 'number') {
            return value;
        }
        return undefined;
    }),
    __metadata("design:type", Number)
], CreateCourtDto.prototype, "pricePerHour", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(['available', 'occupied', 'maintenance'], {
        message: 'El estado debe ser "available", "occupied" o "maintenance"'
    }),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "status", void 0);
//# sourceMappingURL=create-court.dto.js.map