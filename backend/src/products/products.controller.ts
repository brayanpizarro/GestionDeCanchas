import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

@Post()
create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
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
update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
}

@Delete(':id')
remove(@Param('id') id: string) {
    this.productsService.remove(+id);
    return { message: 'Product deleted successfully' };
}

}

