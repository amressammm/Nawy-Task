import { Module } from '@nestjs/common';
import { ApartmentsModule } from './apartments/apartments.module';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, ApartmentsModule],
  controllers: [HealthController],
})
export class AppModule {}
