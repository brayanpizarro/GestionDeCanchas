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
@UseGuards(AuthGuard)
export class ProductsController {
    private readonly logger = new Logger(ProductsController.name);

    constructor(private readonly productsService: ProductsService) {}

    @Post()
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

    @Get()
    async findAll() {
        try {
            return await this.productsService.findAll();
        } catch (error) {
            this.logger.error('Error in findAll controller:', error);
            throw error;
        }
    }

    @Get('low-stock')
    async getLowStockProducts() {
        try {
            return await this.productsService.getLowStockProducts();
        } catch (error) {
            this.logger.error('Error in getLowStockProducts controller:', error);
            throw error;
        }
    }

    @Get('stats')
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
    @UseInterceptors(FileInterceptor('image', multerConfig))
    async update(
        @Param('id') id: string, 
        @Body() updateProductDto: UpdateProductDto, 
        @UploadedFile() file: Express.Multer.File
    ) {
        try {
            // Create a copy of the DTO to avoid mutating the original
            const productData = { ...updateProductDto };
            
            if (file) {
                productData.imagePath = file.path.replace(/\\/g, '/');
            }
            
            return await this.productsService.update(+id, productData);
        } catch (error) {
            this.logger.error(`Error in update controller for ID ${id}:`, error);
            throw error;
        }
    }

    @Delete(':id')
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