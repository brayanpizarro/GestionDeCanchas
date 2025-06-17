import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, Patch, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Controller('courts')
export class CourtsController {
    private readonly logger = new Logger(CourtsController.name);
    
    constructor(private readonly courtsService: CourtsService) {}

    @Post()
    @UseInterceptors(FileInterceptor('image', multerConfig))
    create(@Body() createCourtDto: CreateCourtDto, @UploadedFile() file: Express.Multer.File) {
        this.logger.log('Received create court request:', {
            dto: createCourtDto,
            hasFile: !!file,
            fileName: file?.originalname,
            filePath: file?.path,
        });

        if (file) {
            createCourtDto['imagePath'] = file.path.replace(/\\/g, '/');
            this.logger.log('Added image path to court data:', createCourtDto['imagePath']);
        } else {
            this.logger.warn('No image file received for court creation');
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

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.courtsService.updateStatus(+id, body.status);
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