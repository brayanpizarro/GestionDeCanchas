import { Controller, Get, Post, Body, Param, Put, Query, ValidationPipe, UsePipes, BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) {}

    @Post()
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async create(@Body() createReservationDto: CreateReservationDto) {
        try {
            console.log('Received reservation data:', JSON.stringify(createReservationDto, null, 2));
            return await this.reservationsService.create(createReservationDto);
        } catch (error) {
            console.error('Error creating reservation:', error);
            throw new BadRequestException('Invalid reservation data');
        }
    }

    @Get()
    findAll() {
        return this.reservationsService.findAll();
    }

    // ADD THIS STATS ENDPOINT BEFORE THE :id ROUTE
    @Get('stats')
    async getStats() {
        const [reservations, totalReservations] = await Promise.all([
            this.reservationsService.findAll(),
            this.reservationsService.getTotalCount()
        ]);
        
        const statusCounts: Record<string, number> = reservations.reduce((acc, reservation) => {
            acc[reservation.status] = (acc[reservation.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: totalReservations,
            pending: statusCounts['pending'] || 0,
            confirmed: statusCounts['confirmed'] || 0,
            completed: statusCounts['completed'] || 0,
            cancelled: statusCounts['cancelled'] || 0,
            todayReservations: reservations.filter(r => 
                new Date(r.startTime).toDateString() === new Date().toDateString()
            ).length
        };
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: number) {
        return this.reservationsService.findByUser(userId);
    }

    @Get('available/:courtId')
    getAvailableTimeSlots(
        @Param('courtId') courtId: number,
        @Query('date') date: string,
    ) {
        return this.reservationsService.getAvailableTimeSlots(courtId, date);
    }

    // IMPORTANT: Keep :id routes LAST to avoid conflicts
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.reservationsService.findOne(id);
    }

    @Put(':id/status')
    updateStatus(
        @Param('id') id: number,
        @Body('status') status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
    ) {
        return this.reservationsService.updateStatus(id, status);
    }
}