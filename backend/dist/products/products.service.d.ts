import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private productsRepository;
    private readonly logger;
    constructor(productsRepository: Repository<Product>);
    findAll(): Promise<Product[]>;
    findOne(id: number): Promise<Product>;
    private normalizeImagePath;
    create(createProductDto: CreateProductDto): Promise<Product>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: number): Promise<void>;
    getLowStockProducts(threshold?: number): Promise<Product[]>;
    getStats(): Promise<{
        total: number;
        totalStock: number;
        categories: string[];
        lowStock: number;
    }>;
    getTotalStock(): Promise<number>;
    findByCategory(category: string): Promise<Product[]>;
    searchProducts(searchTerm: string): Promise<Product[]>;
    updateStock(id: number, quantity: number): Promise<Product>;
    bulkUpdateStock(updates: {
        id: number;
        stock: number;
    }[]): Promise<void>;
    getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;
    getRecentMovements(): Promise<{
        id: string;
        productName: string;
        quantity: number;
        amount: number;
        type: string;
        date: Date;
    }[]>;
}
