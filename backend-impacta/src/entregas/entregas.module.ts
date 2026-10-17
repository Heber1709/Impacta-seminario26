import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntregasService } from './entregas.service';
import { EntregasController } from './entregas.controller';
import { Entrega } from './entities/entregas.entity';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { Voluntario } from '../voluntarios/entities/voluntario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Entrega, Voluntario])],
  controllers: [EntregasController],
  providers: [EntregasService, PermissionsGuard],
})
export class EntregasModule {}