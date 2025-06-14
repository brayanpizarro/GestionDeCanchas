import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    private readonly logger;
    constructor(productsService: ProductsService);
    findAll(): Promise<import("./entities/product.entity").Product[]>;
    create(createProductDto: CreateProductDto, file: Express.Multer.File): Promise<import("./entities/product.entity").Product>;
    getLowStockProducts(): Promise<import("./entities/product.entity").Product[]>;
    getStats(): Promise<{
        total: number;
        totalStock: number;
        categories: string[];
        lowStock: number;
    }>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto, file: Express.Multer.File): Promise<import("./entities/product.entity").Product>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
