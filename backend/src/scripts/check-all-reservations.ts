import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { Reservation } from '../reservations/entities/reservation.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function checkAllReservations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const reservationRepository = app.get<Repository<Reservation>>(getRepositoryToken(Reservation));

  console.log('🔍 Verificando todas las reservas...');

  const reservations = await reservationRepository.find({
    relations: ['court', 'user'],
    order: { id: 'ASC' }
  });
  
  console.log(`📊 Total de reservas: ${reservations.length}`);
  
  for (const reservation of reservations) {
    console.log(`\n📋 Reserva ID: ${reservation.id}`);
    console.log(`   Usuario: ${reservation.user?.name || 'Sin usuario'}`);
    console.log(`   Cancha: ${reservation.court?.name || 'Sin cancha'}`);
    console.log(`   Precio cancha: $${reservation.court?.pricePerHour || 'N/A'}`);
    console.log(`   Fecha: ${reservation.startTime.toISOString().split('T')[0]}`);
    console.log(`   Horario: ${reservation.startTime.toTimeString().slice(0,5)} - ${reservation.endTime.toTimeString().slice(0,5)}`);
    console.log(`   Status: ${reservation.status}`);
    console.log(`   Monto: ${reservation.amount} (tipo: ${typeof reservation.amount})`);
    
    if (reservation.amount === null || reservation.amount === undefined || reservation.amount === 0) {
      console.log(`   🔴 PROBLEMA: Monto inválido`);
      
      if (reservation.court && reservation.court.pricePerHour > 0) {
        const start = new Date(reservation.startTime);
        const end = new Date(reservation.endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const newAmount = Number(reservation.court.pricePerHour) * hours;
        
        // Actualizar la reserva
        reservation.amount = newAmount;
        await reservationRepository.save(reservation);
        
        console.log(`   ✅ CORREGIDO: Nuevo monto: $${newAmount} (${hours}h × $${reservation.court.pricePerHour})`);
      }
    } else {
      console.log(`   ✅ Monto OK: $${reservation.amount}`);
    }
  }

  console.log('\n🎉 Verificación completada!');
  await app.close();
}

checkAllReservations().catch(console.error);
