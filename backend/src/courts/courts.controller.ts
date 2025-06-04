import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Controller('courts')
export class CourtsController {
    constructor(private readonly courtsService: CourtsService) {}

    @Post()
    @UseInterceptors(FileInterceptor('image', multerConfig))
    create(@Body() createCourtDto: CreateCourtDto, @UploadedFile() file: Express.Multer.File) {
        if (file) {
            createCourtDto['imagePath'] = file.path.replace(/\\/g, '/');
        }
        return this.courtsService.create(createCourtDto);
    }

    @Get()
    findAll() {
        return this.courtsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.courtsService.findOne(+id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image', multerConfig))
    update(@Param('id') id: string, @Body() updateCourtDto: UpdateCourtDto, @UploadedFile() file: Express.Multer.File) {
        if (file) {
            updateCourtDto['imagePath'] = file.path.replace(/\\/g, '/');
        }
        return this.courtsService.update(+id, updateCourtDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.courtsService.remove(+id);
    }

    @Get('usage/stats')
    getCourtUsage() {
        return this.courtsService.getCourtUsage();
    }
}