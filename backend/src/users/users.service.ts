import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Between, MoreThanOrEqual } from 'typeorm';
import { UserRole, UserStats } from './types/user.types';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) //inyectar el repositorio de usuario
    //el repositorio es una clase que se encarga de interactuar con la base de datos
    private readonly userRepository: Repository<User>, 
  ) {}

  async create(createUserDto: CreateUserDto) { //crear un nuevo usuario
    //el createUserDto es un objeto que contiene los datos del usuario a crear
    return await this.userRepository.save(createUserDto); //guardar el usuario en la base de datos
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
  }

  async getTopPlayers() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.reservations', 'reservation')
      .select([
        'user.id',
        'user.name',
        'COUNT(reservation.id) as reservasCount',
        'SUM(reservation.amount) as totalGasto'
      ])
      .groupBy('user.id')
      .orderBy('reservasCount', 'DESC')
      .limit(4)
      .getRawMany();

    return users.map(user => ({
      id: user.id,
      name: user.name,
      reservas: parseInt(user.reservasCount) || 0,
      gasto: `$${(parseFloat(user.totalGasto) || 0).toLocaleString()}`,
      nivel: this.calculateLevel(parseInt(user.reservasCount) || 0),
      avatar: user.name.split(' ').map((n: string) => n[0]).join('')
    }));
  }

  private calculateLevel(reservasCount: number): string {
    if (reservasCount >= 20) return 'Avanzado';
    if (reservasCount >= 10) return 'Intermedio';
    return 'Principiante';
  }
}