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
exports.CourtsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_config_1 = require("../config/multer.config");
const courts_service_1 = require("./courts.service");
const create_court_dto_1 = require("./dto/create-court.dto");
const update_court_dto_1 = require("./dto/update-court.dto");
let CourtsController = class CourtsController {
    courtsService;
    constructor(courtsService) {
        this.courtsService = courtsService;
    }
    create(createCourtDto, file) {
        if (file) {
            createCourtDto['imagePath'] = file.path.replace(/\\/g, '/');
        }
        return this.courtsService.create(createCourtDto);
    }
    findAll() {
        return this.courtsService.findAll();
    }
    findOne(id) {
        return this.courtsService.findOne(+id);
    }
    update(id, updateCourtDto, file) {
        if (file) {
            updateCourtDto['imagePath'] = file.path.replace(/\\/g, '/');
        }
        return this.courtsService.update(+id, updateCourtDto);
    }
    remove(id) {
        return this.courtsService.remove(+id);
    }
    getCourtUsage() {
        return this.courtsService.getCourtUsage();
    }
};
exports.CourtsController = CourtsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multer_config_1.multerConfig)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_court_dto_1.CreateCourtDto, Object]),
    __metadata("design:returntype", void 0)
], CourtsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CourtsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourtsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multer_config_1.multerConfig)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_court_dto_1.UpdateCourtDto, Object]),
    __metadata("design:returntype", void 0)
], CourtsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourtsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('usage/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CourtsController.prototype, "getCourtUsage", null);
exports.CourtsController = CourtsController = __decorate([
    (0, common_1.Controller)('courts'),
    __metadata("design:paramtypes", [courts_service_1.CourtsService])
], CourtsController);
//# sourceMappingURL=courts.controller.js.map