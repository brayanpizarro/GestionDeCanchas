import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @UseInterceptors(FileInterceptor('image', multerConfig))
    async create(@Body() createProductDto: CreateProductDto, @UploadedFile() file: Express.Multer.File) {
        if (file) {
            createProductDto['imagePath'] = file.path.replace(/\\/g, '/');
        }
        return await this.productsService.create(createProductDto);
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get('low-stock')
    getLowStockProducts() {
        return this.productsService.getLowStockProducts();
    }

    @Get('stats')
    async getStats() {
        const [products, lowStockProducts] = await Promise.all([
            this.productsService.findAll(),
            this.productsService.getLowStockProducts()
        ]);
        const totalStock = await this.productsService.getTotalStock();
        
        return {
            total: products.length,
            totalStock,
            lowStock: lowStockProducts.length,
            categories: [...new Set(products.map(p => p.category))],
        };
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(+id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('image', multerConfig))
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @UploadedFile() file: Express.Multer.File) {
        if (file) {
            updateProductDto['imagePath'] = file.path.replace(/\\/g, '/');
        }
        return await this.productsService.update(+id, updateProductDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        this.productsService.remove(+id);
        return { message: 'Product deleted successfully' };
    }

}

