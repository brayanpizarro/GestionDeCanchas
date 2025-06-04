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

interface RequestWithUser extends Request {
  user: User;
}

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.cardService.create(createCardDto, user);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.cardService.findByUser(user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
  const user = req.user;
  return this.cardService.remove(id, user);
}
}