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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/entities/product.entity");
let ProductsService = class ProductsService {
    productsRepository;
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    async findAll() {
        return await this.productsRepository.find();
    }
    async findOne(id) {
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async create(createProductDto) {
        const product = this.productsRepository.create(createProductDto);
        return await this.productsRepository.save(product);
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        this.productsRepository.merge(product, updateProductDto);
        return await this.productsRepository.save(product);
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.productsRepository.remove(product);
    }
    async getLowStockProducts(threshold = 10) {
        return await this.productsRepository.find({
            where: { stock: (0, typeorm_2.LessThan)(threshold) }
        });
    }
    async getStats() {
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
            totalStock: parseInt(totalStockResult?.totalStock) || 0,
            categories: categoriesResult.map(c => c.category).filter(Boolean),
            lowStock: lowStockCount
        };
    }
    async getTotalStock() {
        const result = await this.productsRepository
            .createQueryBuilder('product')
            .select('SUM(product.stock)', 'totalStock')
            .getRawOne();
        return parseInt(result?.totalStock) || 0;
    }
    async findByCategory(category) {
        return await this.productsRepository.find({
            where: { category }
        });
    }
    async searchProducts(searchTerm) {
        return await this.productsRepository
            .createQueryBuilder('product')
            .where('product.name ILIKE :searchTerm OR product.description ILIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`
        })
            .getMany();
    }
    async updateStock(id, quantity) {
        const product = await this.findOne(id);
        product.previousStock = product.stock;
        product.stock = quantity;
        product.stock = quantity;
        return await this.productsRepository.save(product);
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
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getProductsByPriceRange(minPrice, maxPrice) {
        return await this.productsRepository
            .createQueryBuilder('product')
            .where('product.price >= :minPrice AND product.price <= :maxPrice', {
            minPrice,
            maxPrice
        })
            .orderBy('product.price', 'ASC')
            .getMany();
    }
    async getRecentMovements() {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const products = await this.productsRepository
            .createQueryBuilder('product')
            .select([
            'product.id',
            'product.name',
            'product.stock',
            'product.updatedAt'
        ])
            .where('product.updatedAt >= :sevenDaysAgo', { sevenDaysAgo })
            .orderBy('product.updatedAt', 'DESC')
            .limit(10)
            .getMany();
        return products.map(product => ({
            id: product.id.toString(), productName: product.name,
            quantity: Math.abs(product.stock - (product.previousStock || 0)),
            amount: product.price * Math.abs(product.stock - (product.previousStock || 0)),
            type: product.stock > (product.previousStock || 0) ? 'IN' : 'OUT',
            date: product.updatedAt
        }));
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map