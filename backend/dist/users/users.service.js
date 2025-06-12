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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_types_1 = require("./types/user.types");
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        return await this.userRepository.save(createUserDto);
    }
    async findAll() {
        return await this.userRepository.find();
    }
    async findOne(id) {
        return await this.userRepository.findOne({ where: { id } });
    }
    async findOneByEmail(email) {
        try {
            return await this.userRepository.findOneBy({ email });
        }
        catch (error) {
            console.error('Error finding user by email:', error);
            return null;
        }
    }
    async update(id, updateUserDto) {
        return await this.userRepository.update(id, updateUserDto);
    }
    async remove(id) {
        return await this.userRepository.softDelete(id);
    }
    async getActivePlayerCount() {
        return this.userRepository.count({
            where: {
                status: 'active',
                role: user_types_1.UserRole.USER
            }
        });
    }
    async countActive() {
        return this.userRepository.count({
            where: {
                status: 'active'
            }
        });
    }
    async getStats() {
        const total = await this.userRepository.count();
        const active = await this.userRepository.count({ where: { status: 'active' } });
        const inactive = await this.userRepository.count({ where: { status: 'inactive' } });
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newThisMonth = await this.userRepository.count({
            where: {
                createdAt: (0, typeorm_2.MoreThanOrEqual)(startOfMonth)
            }
        });
        const startOfLastMonth = new Date(startOfMonth);
        startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
        const lastMonthUsers = await this.userRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(startOfLastMonth, startOfMonth)
            }
        });
        const growth = lastMonthUsers > 0 ? ((newThisMonth - lastMonthUsers) / lastMonthUsers) * 100 : 0;
        const lastRegistered = await this.userRepository.findOne({
            order: { createdAt: 'DESC' }
        });
        return {
            total,
            active,
            inactive,
            newThisMonth,
            growth,
            lastRegistered: lastRegistered?.createdAt || null
        };
    }
    async getTopPlayers() {
        const users = await this.userRepository
            .createQueryBuilder('user')
            .leftJoin('user.reservations', 'reservation')
            .select([
            'user.id as user_id',
            'user.name as user_name',
            'COUNT(reservation.id) as reservationCount',
            'SUM(reservation.amount) as totalSpent'
        ])
            .groupBy('user.id, user.name')
            .orderBy('reservationCount', 'DESC')
            .limit(4)
            .getRawMany();
        return users.map(user => ({
            id: user.user_id,
            name: user.user_name,
            reservas: parseInt(user.reservationCount) || 0,
            gasto: `$${(parseFloat(user.totalSpent) || 0).toLocaleString()}`,
            nivel: this.calculateLevel(parseInt(user.reservationCount) || 0),
            avatar: user.user_name.split(' ').map((n) => n[0]).join('')
        }));
    }
    calculateLevel(reservasCount) {
        if (reservasCount >= 20) {
            return 'Avanzado';
        }
        if (reservasCount >= 10) {
            return 'Intermedio';
        }
        return 'Principiante';
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map