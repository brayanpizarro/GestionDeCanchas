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
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/entities/product.entity");
let ProductsService = ProductsService_1 = class ProductsService {
    productsRepository;
    logger = new common_1.Logger(ProductsService_1.name);
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    async findAll() {
        try {
            const products = await this.productsRepository.find();
            return products.map(product => ({
                ...product,
                imageUrl: product.imagePath ? this.normalizeImagePath(product.imagePath) : undefined
            }));
        }
        catch (error) {
            this.logger.error('Error finding all products:', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve products');
        }
    }
    async findOne(id) {
        try {
            const product = await this.productsRepository.findOne({ where: { id } });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${id} not found`);
            }
            return {
                ...product,
                imageUrl: product.imagePath ? this.normalizeImagePath(product.imagePath) : undefined
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error finding product with ID ${id}:`, error);
            throw new common_1.InternalServerErrorException('Failed to retrieve product');
        }
    }
    normalizeImagePath(imagePath) {
        if (!imagePath)
            return '';
        let cleanPath = imagePath.replace(/^\/+uploads\/+/g, '');
        cleanPath = cleanPath.replace(/^uploads\/+/g, '');
        const finalPath = `/uploads/${cleanPath}`;
        this.logger.debug(`Normalized image path: ${imagePath} -> ${finalPath}`);
        return finalPath;
    }
    async create(createProductDto) {
        try {
            this.logger.log('Creating product with data:', createProductDto);
            if (!createProductDto.name) {
                throw new common_1.BadRequestException('Name is required');
            }
            if (createProductDto.price < 0 || createProductDto.stock < 0) {
                throw new common_1.BadRequestException('Price and stock must be non-negative');
            }
            const product = this.productsRepository.create({
                ...createProductDto,
                category: createProductDto.category || 'General',
                available: createProductDto.available ?? true,
                previousStock: createProductDto.stock
            });
            const savedProduct = await this.productsRepository.save(product);
            this.logger.log('Product created successfully:', savedProduct.id);
            return savedProduct;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error creating product:', error);
            throw new common_1.InternalServerErrorException('Failed to create product');
        }
    }
    async update(id, updateProductDto) {
        try {
            const product = await this.findOne(id);
            if (updateProductDto.stock !== undefined) {
                product.previousStock = product.stock;
            }
            this.productsRepository.merge(product, updateProductDto);
            return await this.productsRepository.save(product);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error updating product with ID ${id}:`, error);
            throw new common_1.InternalServerErrorException('Failed to update product');
        }
    }
    async remove(id) {
        try {
            const product = await this.findOne(id);
            await this.productsRepository.remove(product);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error removing product with ID ${id}:`, error);
            throw new common_1.InternalServerErrorException('Failed to remove product');
        }
    }
    async getLowStockProducts(threshold = 10) {
        try {
            return await this.productsRepository.find({
                where: { stock: (0, typeorm_2.LessThan)(threshold) }
            });
        }
        catch (error) {
            this.logger.error('Error getting low stock products:', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve low stock products');
        }
    }
    async getStats() {
        try {
            const [totalCount, totalStockResult, categoriesResult, lowStockCount] = await Promise.all([
                this.productsRepository.count(),
                this.productsRepository
                    .createQueryBuilder('product')
                    .select('SUM(product.stock)', 'totalStock')
                    .getRawOne(),
                this.productsRepository
                    .createQueryBuilder('product')
                    .select('DISTINCT product.category', 'category')
                    .getRawMany(),
                this.productsRepository.count({ where: { stock: (0, typeorm_2.LessThan)(10) } })
            ]);
            return {
                total: totalCount,
                totalStock: parseInt(totalStockResult && totalStockResult.totalStock ? totalStockResult.totalStock : '0') || 0,
                categories: categoriesResult.map(c => c.category).filter((cat) => Boolean(cat)),
                lowStock: lowStockCount
            };
        }
        catch (error) {
            this.logger.error('Error getting stats:', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve statistics');
        }
    }
    async getTotalStock() {
        try {
            const result = await this.productsRepository
                .createQueryBuilder('product')
                .select('SUM(product.stock)', 'totalStock')
                .getRawOne();
            const totalStock = result?.totalStock;
            if (!totalStock || totalStock === null) {
                return 0;
            }
            const parsed = parseInt(totalStock, 10);
            return isNaN(parsed) ? 0 : parsed;
        }
        catch (error) {
            this.logger.error('Error getting total stock:', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve total stock');
        }
    }
    async findByCategory(category) {
        try {
            return await this.productsRepository.find({
                where: { category }
            });
        }
        catch (error) {
            this.logger.error(`Error finding products by category ${category}:`, error);
            throw new common_1.InternalServerErrorException('Failed to retrieve products by category');
        }
    }
    async searchProducts(searchTerm) {
        try {
            return await this.productsRepository
                .createQueryBuilder('product')
                .where('product.name ILIKE :searchTerm OR product.description ILIKE :searchTerm', {
                searchTerm: `%${searchTerm}%`
            })
                .getMany();
        }
        catch (error) {
            this.logger.error(`Error searching products with term ${searchTerm}:`, error);
            throw new common_1.InternalServerErrorException('Failed to search products');
        }
    }
    async updateStock(id, quantity) {
        try {
            const product = await this.findOne(id);
            product.previousStock = product.stock;
            product.stock = quantity;
            return await this.productsRepository.save(product);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error updating stock for product ${id}:`, error);
            throw new common_1.InternalServerErrorException('Failed to update stock');
        }
    }
    async bulkUpdateStock(updates) {
        const queryRunner = this.productsRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const update of updates) {
                await queryRunner.manager.update(product_entity_1.Product, update.id, { stock: update.stock });
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Error in bulk update stock:', error);
            throw new common_1.InternalServerErrorException('Failed to bulk update stock');
        }
        finally {
            await queryRunner.release();
        }
    }
    async getProductsByPriceRange(minPrice, maxPrice) {
        try {
            return await this.productsRepository
                .createQueryBuilder('product')
                .where('product.price >= :minPrice AND product.price <= :maxPrice', {
                minPrice,
                maxPrice
            })
                .orderBy('product.price', 'ASC')
                .getMany();
        }
        catch (error) {
            this.logger.error('Error getting products by price range:', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve products by price range');
        }
    }
    async getRecentMovements() {
        try {
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const products = await this.productsRepository
                .createQueryBuilder('product')
                .select([
                'product.id',
                'product.name',
                'product.stock',
                'product.previousStock',
                'product.price',
                'product.updatedAt'
            ])
                .where('product.updatedAt >= :sevenDaysAgo', { sevenDaysAgo })
                .orderBy('product.updatedAt', 'DESC')
                .limit(10)
                .getMany();
            return products.map(product => ({
                id: product.id.toString(),
                productName: product.name,
                quantity: Math.abs(product.stock - (product.previousStock || 0)),
                amount: product.price * Math.abs(product.stock - (product.previousStock || 0)),
                type: product.stock > (product.previousStock || 0) ? 'IN' : 'OUT',
                date: product.updatedAt
            }));
        }
        catch (error) {
            this.logger.error('Error getting recent movements:', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve recent movements');
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map