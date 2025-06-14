import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRole, UserStats } from './types/user.types';
import { TopPlayerRaw } from './types/top-player.types';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) //inyectar el repositorio de usuario
    //el repositorio es una clase que se encarga de interactuar con la base de datos
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService
  ) {}

  async create(createUserDto: CreateUserDto) { //crear un nuevo usuario
    //el createUserDto es un objeto que contiene los datos del usuario a crear
    const newUser = await this.userRepository.save(createUserDto); //guardar el usuario en la base de datos
    
    // Enviar email de bienvenida
    try {
      await this.emailService.sendWelcomeEmail(newUser.email, newUser.name);
    } catch (error) {
      console.error('Error enviando email de bienvenida:', error);
      // No fallar la creación del usuario si el email falla
    }
    
    return newUser;
  }

  async findAll() {//buscar todos los usuarios
    //el find() devuelve todos los usuarios de la base de datos
    return await this.userRepository.find();
  }
  
  async findOne(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }
  
  async findOneByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOneBy({ email });
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async updatePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Contraseña actual incorrecta', HttpStatus.UNAUTHORIZED);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(id, { password: hashedPassword });
    
    // Enviar notificación por email del cambio de contraseña
    try {
      await this.emailService.sendPasswordChangeNotification(user.email, user.name);
    } catch (error) {
      console.error('Error enviando notificación de cambio de contraseña:', error);
      // No fallar la actualización si el email falla
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {//actualizar un usuario por id
    //el id es unico por lo que no se puede repetir
    return await this.userRepository.update(id, updateUserDto); //actualizar el usuario en la base de datos (se le pasa el id y el dto)
  }

  async remove(id: number) {//eliminar un usuario por id
    //el id es unico por lo que no se puede repetir
    return await this.userRepository.softDelete(id); //eliminar el usuario de la base de datos (se le pasa el id)
    //return await this.useraRepository.softRemove(id); //eliminar el usuario de la base de datos (se le pasa ña instancia del usuario)
  }
  async getActivePlayerCount(): Promise<number> {
    return this.userRepository.count({
      where: {
        status: 'active',
        role: UserRole.USER
      }
    });
  }

  async countActive(): Promise<number> {
    return this.userRepository.count({
      where: {
        status: 'active'
      }
    });
  }

  async getStats(): Promise<UserStats> {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { status: 'active' } });
    const inactive = await this.userRepository.count({ where: { status: 'inactive' } });
    
    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newThisMonth = await this.userRepository.count({
      where: {
        createdAt: MoreThanOrEqual(startOfMonth)
      }
    });

    // Calculate growth (compared to last month)
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    
    const lastMonthUsers = await this.userRepository.count({
      where: {
        createdAt: Between(startOfLastMonth, startOfMonth)
      }
    });

    const growth = lastMonthUsers > 0 ? ((newThisMonth - lastMonthUsers) / lastMonthUsers) * 100 : 0;

    // Get last registered user
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
  }  async getTopPlayers() {
    const users = await this.userRepository.createQueryBuilder('user').leftJoin('user.reservations', 'reservation')
      .select([
        'user.id as user_id',
        'user.name as user_name',
        'COUNT(reservation.id) as reservationCount',
        'SUM(reservation.amount) as totalSpent'
      ])
      .groupBy('user.id, user.name')
      .orderBy('reservationCount', 'DESC')
      .limit(4)
      .getRawMany() as TopPlayerRaw[];

    return users.map(user => ({
      id: user.user_id,
      name: user.user_name,
      reservas: parseInt(user.reservationCount) || 0,
      gasto: `$${(parseFloat(user.totalSpent) || 0).toLocaleString()}`,
      nivel: this.calculateLevel(parseInt(user.reservationCount) || 0),
      avatar: user.user_name.split(' ').map((n: string) => n[0]).join('')
    }));
  }
  private calculateLevel(reservasCount: number): string {
    if (reservasCount >= 20) {
      return 'Avanzado';
    }
    if (reservasCount >= 10) {
      return 'Intermedio';
    }
    return 'Principiante';
  }

  // Métodos para manejo de saldo
  async addBalance(userId: number, amount: number): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    user.balance = (user.balance || 0) + amount;
    return await this.userRepository.save(user);
  }

  async deductBalance(userId: number, amount: number): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    if ((user.balance || 0) < amount) {
      throw new HttpException('Saldo insuficiente', HttpStatus.BAD_REQUEST);
    }

    user.balance = (user.balance || 0) - amount;
    return await this.userRepository.save(user);
  }

  async getBalance(userId: number): Promise<number> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    return user.balance || 0;
  }

  async setBalance(userId: number, amount: number): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    user.balance = amount;
    return await this.userRepository.save(user);
  }
}