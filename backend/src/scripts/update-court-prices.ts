import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { Court } from '../courts/entities/court.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function updateCourtPrices() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const courtRepository = app.get<Repository<Court>>(getRepositoryToken(Court));

  console.log('🔍 Verificando precios de canchas...');

  // Obtener todas las canchas
  const courts = await courtRepository.find();
  
  console.log(`📊 Total de canchas encontradas: ${courts.length}`);
  
  for (const court of courts) {
    console.log(`\n🏟️  Cancha: ${court.name}`);
    console.log(`   ID: ${court.id}`);
    console.log(`   Precio actual: $${court.pricePerHour || 'NO CONFIGURADO'}`);
    
    // Si no tiene precio o es 0, asignar un precio por defecto
    if (!court.pricePerHour || court.pricePerHour <= 0) {
      court.pricePerHour = 15000; // Precio por defecto: $15,000 por hora
      await courtRepository.save(court);
      console.log(`   ✅ Precio actualizado a: $${court.pricePerHour}`);
    } else {
      console.log(`   ✅ Precio ya configurado: $${court.pricePerHour}`);
    }
  }

  console.log('\n🎉 Proceso completado!');
  await app.close();
}

updateCourtPrices().catch(console.error);
