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
var ProductsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const auth_guard_1 = require("../auth/guard/auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_config_1 = require("../config/multer.config");
let ProductsController = ProductsController_1 = class ProductsController {
    productsService;
    logger = new common_1.Logger(ProductsController_1.name);
    constructor(productsService) {
        this.productsService = productsService;
    }
    async findAll() {
        try {
            return await this.productsService.findAll();
        }
        catch (error) {
            this.logger.error('Error in findAll controller:', error);
            throw error;
        }
    }
    async create(createProductDto, file) {
        try {
            this.logger.log('Received create product request:', {
                dto: createProductDto,
                hasFile: !!file,
                name: createProductDto.name,
                category: createProductDto.category,
                price: createProductDto.price,
                stock: createProductDto.stock
            });
            const productData = { ...createProductDto };
            if (file) {
                productData.imagePath = file.path.replace(/\\/g, '/');
                this.logger.log('Added image path:', productData.imagePath);
            }
            const result = await this.productsService.create(productData);
            this.logger.log('Product created successfully:', result.id);
            return result;
        }
        catch (error) {
            this.logger.error('Error in create controller:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to create product', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getLowStockProducts() {
        try {
            return await this.productsService.getLowStockProducts();
        }
        catch (error) {
            this.logger.error('Error in getLowStockProducts controller:', error);
            throw error;
        }
    }
    async getStats() {
        try {
            return await this.productsService.getStats();
        }
        catch (error) {
            this.logger.error('Error in getStats controller:', error);
            throw error;
        }
    }
    async findOne(id) {
        try {
            return await this.productsService.findOne(+id);
        }
        catch (error) {
            this.logger.error(`Error in findOne controller for ID ${id}:`, error);
            throw error;
        }
    }
    async update(id, updateProductDto, file) {
        try {
            this.logger.log('Received update product request:', {
                id,
                dto: updateProductDto,
                hasFile: !!file,
                types: {
                    price: typeof updateProductDto.price,
                    stock: typeof updateProductDto.stock,
                    available: typeof updateProductDto.available
                }
            });
            const productData = { ...updateProductDto };
            if (productData.price !== undefined) {
                productData.price = typeof productData.price === 'string'
                    ? parseFloat(productData.price)
                    : productData.price;
            }
            if (productData.stock !== undefined) {
                productData.stock = typeof productData.stock === 'string'
                    ? parseInt(productData.stock, 10)
                    : productData.stock;
            }
            if (productData.available !== undefined) {
                if (typeof productData.available === 'string') {
                    productData.available = productData.available.toLowerCase() === 'true';
                }
            }
            if (file) {
                productData.imagePath = file.path.replace(/\\/g, '/');
                this.logger.log('Added image path:', productData.imagePath);
            }
            this.logger.log('Transformed product data:', {
                ...productData,
                types: {
                    price: typeof productData.price,
                    stock: typeof productData.stock,
                    available: typeof productData.available
                }
            });
            const result = await this.productsService.update(+id, productData);
            this.logger.log('Product updated successfully:', result.id);
            return result;
        }
        catch (error) {
            this.logger.error(`Error in update controller for ID ${id}:`, error);
            throw error;
        }
    }
    async remove(id) {
        try {
            await this.productsService.remove(+id);
            return { message: 'Product deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error in remove controller for ID ${id}:`, error);
            throw error;
        }
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multer_config_1.multerConfig)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getLowStockProducts", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multer_config_1.multerConfig)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
exports.ProductsController = ProductsController = ProductsController_1 = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map