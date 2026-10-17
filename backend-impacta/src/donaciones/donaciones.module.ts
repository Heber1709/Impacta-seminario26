import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonacionesService } from './donaciones.service';
import { DonacionesController } from './donaciones.controller';
import { Donacion } from './entities/donaciones.entity';
import { PermissionsGuard } from '../permissions/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Donacion])],
  controllers: [DonacionesController],
  providers: [DonacionesService, PermissionsGuard],
})
export class DonacionesModule {}