"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CourtsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourtsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const court_entity_1 = require("./entities/court.entity");
const reservation_entity_1 = require("../reservations/entities/reservation.entity");
let CourtsService = CourtsService_1 = class CourtsService {
    courtsRepository;
    reservationsRepository;
    logger = new common_1.Logger(CourtsService_1.name);
    constructor(courtsRepository, reservationsRepository) {
        this.courtsRepository = courtsRepository;
        this.reservationsRepository = reservationsRepository;
    }
    normalizeImagePath(imagePath) {
        if (!imagePath)
            return '';
        let cleanPath = imagePath.replace(/^\/+uploads\/+/g, '');
        cleanPath = cleanPath.replace(/^uploads\/+/g, '');
        const finalPath = `/uploads/${cleanPath}`;
        this.logger.debug(`Normalized image path: ${imagePath} -> ${finalPath}`);
        return finalPath;
    }
    async create(createCourtDto) {
        this.logger.log('Creating court with data:', {
            ...createCourtDto,
            hasImagePath: !!createCourtDto.imagePath
        });
        const court = this.courtsRepository.create({
            ...createCourtDto,
            rating: 4.5,
            isCovered: createCourtDto.isCovered ?? (createCourtDto.type === 'covered'),
        });
        const savedCourt = await this.courtsRepository.save(court);
        this.logger.log('Court saved successfully:', {
            id: savedCourt.id,
            name: savedCourt.name,
            imagePath: savedCourt.imagePath,
            hasImagePath: !!savedCourt.imagePath
        });
        const result = savedCourt;
        result.imageUrl = savedCourt.imagePath ? this.normalizeImagePath(savedCourt.imagePath) : undefined;
        return result;
    }
    async findAll() {
        const courts = await this.courtsRepository.find();
        return courts.map(court => {
            const result = court;
            result.imageUrl = court.imagePath ? this.normalizeImagePath(court.imagePath) : undefined;
            return result;
        });
    }
    async getRecentReservations() {
        return this.reservationsRepository.find({
            relations: ['court', 'user'],
            order: { createdAt: 'DESC' },
            take: 5
        });
    }
    async findOne(id) {
        const court = await this.courtsRepository.findOne({ where: { id } });
        if (!court) {
            throw new common_1.NotFoundException(`Court with ID ${id} not found`);
        }
        const result = court;
        result.imageUrl = court.imagePath ? this.normalizeImagePath(court.imagePath) : undefined;
        return result;
    }
    async updateStatus(id, status) {
        const court = await this.findOne(id);
        court.status = status;
        return await this.courtsRepository.save(court);
    }
    async update(id, updateCourtDto) {
        const court = await this.findOne(id);
        this.courtsRepository.merge(court, updateCourtDto);
        const savedCourt = await this.courtsRepository.save(court);
        const result = savedCourt;
        result.imageUrl = savedCourt.imagePath ? this.normalizeImagePath(savedCourt.imagePath) : undefined;
        return result;
    }
    async remove(id) {
        const court = await this.findOne(id);
        const reservations = await this.reservationsRepository.find({
            where: { court: { id: court.id } }
        });
        if (reservations.length > 0) {
            throw new Error('No se puede eliminar la cancha porque tiene reservaciones asociadas');
        }
        try {
            await this.courtsRepository.remove(court);
        }
        catch (error) {
            console.error('Error al eliminar la cancha:', error);
            throw new Error('Error al eliminar la cancha');
        }
    }
    async getReservationsForDate(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.reservationsRepository.find({
            where: {
                startTime: (0, typeorm_2.Between)(startOfDay, endOfDay)
            },
            relations: ['court', 'user']
        });
    }
    async getRecentBookings() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const reservations = await this.reservationsRepository.find({
            where: {
                startTime: (0, typeorm_2.Between)(sevenDaysAgo, new Date())
            },
            relations: ['court', 'user'],
            order: {
                startTime: 'DESC'
            },
            take: 10
        });
        return reservations.map(res => ({
            id: res.id.toString(),
            courtName: res.court?.name || 'Sin cancha',
            userName: res.user?.name || 'Sin usuario',
            date: res.startTime,
            status: res.status || 'pending',
            amount: Number(res.amount) || 0
        }));
    }
    async getCourtUsage() {
        const courts = await this.courtsRepository.find({
            relations: ['reservations'],
        });
        return courts.map((court) => {
            const totalSlots = 14 * 12;
            const reservedSlots = court.reservations?.length || 0;
            const usage = (reservedSlots / totalSlots) * 100;
            const revenue = court.reservations?.reduce((sum, res) => sum + (Number(res.amount) || 0), 0) || 0;
            return {
                id: court.id.toString(),
                name: court.name,
                totalHours: reservedSlots,
                usagePercentage: Math.min(100, Math.round(usage)),
                reservationsCount: reservedSlots,
                revenue: revenue
            };
        });
    }
    async getStats() {
        const courts = await this.findAll();
        const available = courts.filter(court => court.status === 'available');
        const maintenance = courts.filter(court => court.status === 'maintenance');
        const occupied = courts.filter(court => court.status === 'occupied');
        const courtsWithReservations = await this.courtsRepository.find({
            relations: ['reservations'],
        });
        const totalReservations = courtsWithReservations.reduce((sum, court) => sum + (court.reservations?.length || 0), 0);
        return {
            total: courts.length,
            available: available.length,
            underMaintenance: maintenance.length,
            occupied: occupied.length,
            totalReservations,
            averageRating: parseFloat((courts.reduce((acc, court) => acc + court.rating, 0) / courts.length).toFixed(1))
        };
    }
};
exports.CourtsService = CourtsService;
exports.CourtsService = CourtsService = CourtsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(court_entity_1.Court)),
    __param(1, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CourtsService);
//# sourceMappingURL=courts.service.js.map