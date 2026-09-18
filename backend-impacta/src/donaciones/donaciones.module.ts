import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonacionesService } from './donaciones.service';
import { DonacionesController } from './donaciones.controller';
import { Donacion } from './entities/donaciones.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donacion])],
  controllers: [DonacionesController],
  providers: [DonacionesService],
})
export class DonacionesModule {}