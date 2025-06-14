import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    UseGuards, 
    UseInterceptors, 
    UploadedFile,
    HttpException,
    HttpStatus,
    Logger
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';

@Controller('products')
export class ProductsController {
    private readonly logger = new Logger(ProductsController.name);

    constructor(private readonly productsService: ProductsService) {}

    // Endpoint público para obtener todos los productos (usado en reservaciones)
    @Get()
    async findAll() {
        try {
            return await this.productsService.findAll();
        } catch (error) {
            this.logger.error('Error in findAll controller:', error);
            throw error;
        }
    }

    // Endpoints protegidos para gestión de productos
    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('image', multerConfig))
    async create(
        @Body() createProductDto: CreateProductDto, 
        @UploadedFile() file: Express.Multer.File
    ) {
        try {
            this.logger.log('Received create product request:', {
                dto: createProductDto,
                hasFile: !!file,
                name: createProductDto.name,
                category: createProductDto.category,
                price: createProductDto.price,
                stock: createProductDto.stock
            });

            // Create a copy of the DTO to avoid mutating the original
            const productData = { ...createProductDto };
            
            if (file) {
                productData.imagePath = file.path.replace(/\\/g, '/');
                this.logger.log('Added image path:', productData.imagePath);
            }

            const result = await this.productsService.create(productData);
            this.logger.log('Product created successfully:', result.id);
            return result;
        } catch (error) {
            this.logger.error('Error in create controller:', error);
            
            if (error instanceof HttpException) {
                throw error;
            }
            
            throw new HttpException(
                'Failed to create product',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('low-stock')
    @UseGuards(AuthGuard)
    async getLowStockProducts() {
        try {
            return await this.productsService.getLowStockProducts();
        } catch (error) {
            this.logger.error('Error in getLowStockProducts controller:', error);
            throw error;
        }
    }

    @Get('stats')
    @UseGuards(AuthGuard)
    async getStats() {
        try {
            return await this.productsService.getStats();
        } catch (error) {
            this.logger.error('Error in getStats controller:', error);
            throw error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            return await this.productsService.findOne(+id);
        } catch (error) {
            this.logger.error(`Error in findOne controller for ID ${id}:`, error);
            throw error;
        }
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('image', multerConfig))
    async update(
        @Param('id') id: string, 
        @Body() updateProductDto: UpdateProductDto, 
        @UploadedFile() file: Express.Multer.File
    ) {
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

            // Create a copy of the DTO to avoid mutating the original
            const productData = { ...updateProductDto };
            
            // Manual transformation as backup (in case class-transformer doesn't work)
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
                    productData.available = (productData.available as string).toLowerCase() === 'true';
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
        } catch (error) {
            this.logger.error(`Error in update controller for ID ${id}:`, error);
            throw error;
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async remove(@Param('id') id: string) {
        try {
            await this.productsService.remove(+id);
            return { message: 'Product deleted successfully' };
        } catch (error) {
            this.logger.error(`Error in remove controller for ID ${id}:`, error);
            throw error;
        }
    }
}