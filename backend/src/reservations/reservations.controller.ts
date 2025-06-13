import { Controller, Get, Post, Body, Param, Put, Query, ValidationPipe, UsePipes, BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { sendReservationConfirmation } from '../utils/email.utils';

@Controller('reservations')
export class ReservationsController {
    constructor(
        private readonly reservationsService: ReservationsService
    ) {}
    @Post()
    @Post()
    // @UseGuards(JwtAuthGuard) // Temporalmente comentado para depurar
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

    // ADD THIS STATS ENDPOINT BEFORE THE :id ROUTE
    @Get('stats')
    async getStats() {
        // Para estadísticas del admin, necesitamos TODAS las reservas
        const [reservations, totalReservations] = await Promise.all([
            this.reservationsService.findAll(), // Todas las reservas para estadísticas
            this.reservationsService.getTotalCount()
        ]);
        
        const statusCounts: Record<string, number> = reservations.reduce((acc, reservation) => {
            acc[reservation.status] = (acc[reservation.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Crear estadísticas por cancha
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
            // Agregar estadísticas por cancha para el gráfico
            courtStats: Object.values(courtStats)
        };
    }

    @Get('debug')
    async getDebugReservations() {
        // Obtener TODAS las reservas incluyendo eliminadas a través del servicio
        const allReservations = await this.reservationsService.findAllWithDeleted();

        console.log('🔍 DEBUG - Total reservas (incluyendo eliminadas):', allReservations.length);
        
        return {
            total: allReservations.length,
            reservations: allReservations
        };
    }

    @Get('all')
    async findAllReservations() {
        // Este endpoint devuelve TODAS las reservas sin filtros de usuario
        // Solo para administradores
        console.log('🔍 Admin solicitando TODAS las reservas...');
        const allReservations = await this.reservationsService.findAll();
        console.log(`📊 Total de reservas encontradas: ${allReservations.length}`);
        allReservations.forEach((reservation, index) => {
            console.log(`📋 Reserva ${index + 1}:`, {
                id: reservation.id,
                user: reservation.user?.name || 'Sin usuario',
                court: reservation.court?.name || 'Sin cancha',
                status: reservation.status,
                date: new Date(reservation.startTime).toLocaleDateString()
            });
        });
        return allReservations;
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
    @Post(':id/pay')
    // @UseGuards(JwtAuthGuard) // Temporalmente comentado para depurar
    async processPayment(
        @Param('id') reservationId: number,
        @Body('userId') userId: number, // Volvemos a usar el userId del body temporalmente
    ) {
        // Si no se proporciona userId, usar uno por defecto para testing
        const finalUserId = userId || 1;
        return this.reservationsService.processPayment(reservationId, finalUserId);
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

    @Get('test-email')
    async testEmail() {
        console.log('🧪 Endpoint de prueba de email llamado');
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            return {
                success: false,
                message: 'Variables de entorno de email no configuradas',
                config: {
                    EMAIL_USER: process.env.EMAIL_USER ? 'Configurado' : 'NO CONFIGURADO',
                    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Configurado' : 'NO CONFIGURADO'
                }
            };
        }

        try {
            const testReservationData = {
                id: 999,
                courtName: 'Cancha de Prueba',
                date: new Date().toISOString(),
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                duration: 60,
                players: ['Juan Pérez', 'María González']
            };

            await sendReservationConfirmation(
                process.env.EMAIL_USER,
                'Usuario de Prueba',
                testReservationData
            );

            return {
                success: true,
                message: 'Email de prueba enviado exitosamente',
                sentTo: process.env.EMAIL_USER
            };
        } catch (error) {
            console.error('❌ Error en prueba de email:', error);
            return {
                success: false,
                message: 'Error enviando email de prueba',
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }

    @Get('availability/:courtId')
    async getAvailability(
        @Param('courtId') courtId: number,
        @Query('date') date: string,
    ) {
        return this.reservationsService.getTimeSlotsWithAvailability(courtId, date);
    }
}