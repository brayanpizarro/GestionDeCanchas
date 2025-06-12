import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>
  ) {}

  async findAll(): Promise<Product[]> {
    try {
      return await this.productsRepository.find();
    } catch (error) {
      this.logger.error('Error finding all products:', error);
      throw new InternalServerErrorException('Failed to retrieve products');
    }
  }

  async findOne(id: number): Promise<Product> {
    try {
      const product = await this.productsRepository.findOne({ where: { id } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding product with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to retrieve product');
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      this.logger.log('Creating product with data:', createProductDto);
      
      // Validate required fields
      if (!createProductDto.name) {
        throw new BadRequestException('Name is required');
      }

      if (createProductDto.price < 0 || createProductDto.stock < 0) {
        throw new BadRequestException('Price and stock must be non-negative');
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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error creating product:', error);
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    try {
      const product = await this.findOne(id);
      
      // Store previous stock before updating
      if (updateProductDto.stock !== undefined) {
        product.previousStock = product.stock;
      }

      this.productsRepository.merge(product, updateProductDto);
      return await this.productsRepository.save(product);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating product with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const product = await this.findOne(id);
      await this.productsRepository.remove(product);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing product with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to remove product');
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      return await this.productsRepository.find({
        where: { stock: LessThan(threshold) }
      });
    } catch (error) {
      this.logger.error('Error getting low stock products:', error);
      throw new InternalServerErrorException('Failed to retrieve low stock products');
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
        this.productsRepository.count({ where: { stock: LessThan(10) } })
      ]);

      return {
        total: totalCount,
        totalStock: parseInt(totalStockResult?.totalStock) || 0,
        categories: categoriesResult.map(c => c.category).filter(Boolean),
        lowStock: lowStockCount
      };
    } catch (error) {
      this.logger.error('Error getting stats:', error);
      throw new InternalServerErrorException('Failed to retrieve statistics');
    }
  }

  async getTotalStock(): Promise<number> {
    try {
      const result = await this.productsRepository
        .createQueryBuilder('product')
        .select('SUM(product.stock)', 'totalStock')
        .getRawOne();
      
      return parseInt(result?.totalStock) || 0;
    } catch (error) {
      this.logger.error('Error getting total stock:', error);
      throw new InternalServerErrorException('Failed to retrieve total stock');
    }
  }

  async findByCategory(category: string): Promise<Product[]> {
    try {
      return await this.productsRepository.find({
        where: { category }
      });
    } catch (error) {
      this.logger.error(`Error finding products by category ${category}:`, error);
      throw new InternalServerErrorException('Failed to retrieve products by category');
    }
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      return await this.productsRepository
        .createQueryBuilder('product')
        .where('product.name ILIKE :searchTerm OR product.description ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`
        })
        .getMany();
    } catch (error) {
      this.logger.error(`Error searching products with term ${searchTerm}:`, error);
      throw new InternalServerErrorException('Failed to search products');
    }
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    try {
      const product = await this.findOne(id);
      product.previousStock = product.stock;
      product.stock = quantity;
      return await this.productsRepository.save(product);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating stock for product ${id}:`, error);
      throw new InternalServerErrorException('Failed to update stock');
    }
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
      this.logger.error('Error in bulk update stock:', error);
      throw new InternalServerErrorException('Failed to bulk update stock');
    } finally {
      await queryRunner.release();
    }
  }

  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    try {
      return await this.productsRepository
        .createQueryBuilder('product')
        .where('product.price >= :minPrice AND product.price <= :maxPrice', {
          minPrice,
          maxPrice
        })
        .orderBy('product.price', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error('Error getting products by price range:', error);
      throw new InternalServerErrorException('Failed to retrieve products by price range');
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
    } catch (error) {
      this.logger.error('Error getting recent movements:', error);
      throw new InternalServerErrorException('Failed to retrieve recent movements');
    }
  }
}