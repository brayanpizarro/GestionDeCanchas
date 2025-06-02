import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    this.productsRepository.merge(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  // Fixed: Use database query instead of fetching all records
  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { stock: LessThan(threshold) }
    });
  }

  // Optimized: Use database aggregation queries
  async getStats() {
    // Get basic counts and aggregations
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
      this.productsRepository.count({ where: { stock: LessThan(10) } })
    ]);

    return {
      total: totalCount,
      totalStock: parseInt(totalStockResult?.totalStock) || 0,
      categories: categoriesResult.map(c => c.category).filter(Boolean),
      lowStock: lowStockCount
    };
  }

  // Optimized: Use database aggregation
  async getTotalStock(): Promise<number> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('SUM(product.stock)', 'totalStock')
      .getRawOne();
    
    return parseInt(result?.totalStock) || 0;
  }

  // Additional useful methods
  async findByCategory(category: string): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { category }
    });
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    return await this.productsRepository
      .createQueryBuilder('product')
      .where('product.name ILIKE :searchTerm OR product.description ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`
      })
      .getMany();
  }
  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.previousStock = product.stock;
    product.stock = quantity;
    product.stock = quantity;
    return await this.productsRepository.save(product);
  }

  async bulkUpdateStock(updates: { id: number; stock: number }[]): Promise<void> {
    const queryRunner = this.productsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const update of updates) {
        await queryRunner.manager.update(Product, update.id, { stock: update.stock });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
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
      id: product.id.toString(),            productName: product.name,
      quantity: Math.abs(product.stock - (product.previousStock || 0)),
      amount: product.price * Math.abs(product.stock - (product.previousStock || 0)),
      type: product.stock > (product.previousStock || 0) ? 'IN' : 'OUT',
      date: product.updatedAt
    }));
  }
}