import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { Request } from 'express';
import { User } from '@users/entities/user.entity';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto, @Req() req: Request) {
    const user = req.user as User;
    return this.cardService.create(createCardDto, user);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as User;
    return this.cardService.findByUser(user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
  const user = req.user as User;
  return this.cardService.remove(id, user);
}
}