import { Controller, Get, Post, Body, Param, Put, Query, ValidationPipe, UsePipes, BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
    constructor( private readonly reservationsService: ReservationsService ) {}

    @Post()
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async create(@Body() createReservationDto: CreateReservationDto) {
        try {
            // Para depuración temporal, usar userId fijo si no hay autenticación
            if (!createReservationDto.userId) {
                createReservationDto.userId = 1; // Usuario por defecto para testing
            }
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

        const courtStats = reservations.reduce((acc, reservation) => {
            const courtName = reservation.court?.name || 'Cancha desconocida';
            if (!acc[courtName]) {
                acc[courtName] = { courtId: reservation.court?.id, court: courtName, reservations: 0 };
            }
            acc[courtName].reservations++;
            return acc;
        }, {} as Record<string, { courtId?: number; court: string; reservations: number }>);

        return {
            total: totalReservations,
            pending: statusCounts['pending'] || 0,
            confirmed: statusCounts['confirmed'] || 0,
            completed: statusCounts['completed'] || 0,
            cancelled: statusCounts['cancelled'] || 0,
            todayReservations: reservations.filter(r => 
                new Date(r.startTime).toDateString() === new Date().toDateString()
            ).length,
            courtStats: Object.values(courtStats)
        };
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: number) {
        return this.reservationsService.findByUser(userId);
    }

    /**
     * Obtiene horarios disponibles para una cancha específica en una fecha
     */
    @Get('courts/:courtId/available-slots')
    async getAvailableTimeSlots(
        @Param('courtId') courtId: number,
        @Query('date') date: string
    ) {
        if (!date) {
            throw new BadRequestException('Date parameter is required');
        }
        return await this.reservationsService.getAvailableTimeSlots(courtId, date);
    }

    /**
     * Verifica si una cancha está disponible en un horario específico
     */
    @Get('courts/:courtId/check-availability')
    async checkCourtAvailability(
        @Param('courtId') courtId: number,
        @Query('startTime') startTime: string,
        @Query('endTime') endTime: string
    ) {
        if (!startTime || !endTime) {
            throw new BadRequestException('startTime and endTime parameters are required');
        }

        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new BadRequestException('Invalid date format');
        }

        const isAvailable = await this.reservationsService.isCourtAvailable(courtId, startDate, endDate);
        
        return {
            courtId,
            startTime,
            endTime,
            available: isAvailable
        };
    }

    @Post(':id/pay')
    async processPayment(
        @Param('id') reservationId: number,
        @Body('userId') userId: number,
    ) {
        const finalUserId = userId || 1;
        return this.reservationsService.processPayment(reservationId, finalUserId);
    }

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
