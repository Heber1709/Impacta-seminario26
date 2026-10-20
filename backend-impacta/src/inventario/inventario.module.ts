import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { Inventario } from './entities/inventario.entity';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { Entrega } from '../entregas/entities/entregas.entity';
import { TipoMovimiento } from '../tipos-movimiento/entities/tipo-movimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventario, Entrega, TipoMovimiento])],
  controllers: [InventarioController],
  providers: [InventarioService, PermissionsGuard],
})
export class InventarioModule {}