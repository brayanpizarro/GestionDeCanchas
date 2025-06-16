import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { Reservation } from '../reservations/entities/reservation.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function recalculateReservationAmounts() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const reservationRepository = app.get<Repository<Reservation>>(getRepositoryToken(Reservation));

  console.log('🔍 Recalculando montos de reservas...');

  // Obtener todas las reservas con monto 0
  const reservations = await reservationRepository.find({
    relations: ['court'],
    where: { amount: 0 }
  });
  
  console.log(`📊 Reservas con monto $0 encontradas: ${reservations.length}`);
  
  for (const reservation of reservations) {
    console.log(`\n📋 Reserva ID: ${reservation.id}`);
    console.log(`   Cancha: ${reservation.court?.name || 'Sin cancha'}`);
    console.log(`   Fecha: ${reservation.startTime.toISOString()} - ${reservation.endTime.toISOString()}`);
    console.log(`   Monto actual: $${reservation.amount}`);
    
    if (reservation.court && reservation.court.pricePerHour > 0) {
      // Recalcular el monto
      const start = new Date(reservation.startTime);
      const end = new Date(reservation.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const newAmount = Number(reservation.court.pricePerHour) * hours;
      
      // Actualizar la reserva
      reservation.amount = newAmount;
      await reservationRepository.save(reservation);
      
      console.log(`   ✅ Monto recalculado: $${newAmount} (${hours}h × $${reservation.court.pricePerHour})`);
    } else {
      console.log(`   ❌ No se puede recalcular: cancha sin precio`);
    }
  }

  console.log('\n🎉 Proceso de recálculo completado!');
  await app.close();
}

recalculateReservationAmounts().catch(console.error);
