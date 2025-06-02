import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
} from '@nestjs/common';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Controller('courts')
export class CourtsController {
    constructor(private readonly courtsService: CourtsService) {}

    @Post()
    create(@Body() createCourtDto: CreateCourtDto) {
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
    update(@Param('id') id: string, @Body() updateCourtDto: UpdateCourtDto) {
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