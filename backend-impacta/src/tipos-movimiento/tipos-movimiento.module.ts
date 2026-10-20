import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { TipoMovimiento } from './entities/tipo-movimiento.entity';
import { TiposMovimientoController } from './tipos-movimiento.controller';
import { TiposMovimientoService } from './tipos-movimiento.service';
import { Inventario } from '../inventario/entities/inventario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoMovimiento, Inventario])],
  controllers: [TiposMovimientoController],
  providers: [TiposMovimientoService, PermissionsGuard],
})
export class TiposMovimientoModule {}
