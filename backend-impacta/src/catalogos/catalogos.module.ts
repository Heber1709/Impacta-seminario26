import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiario } from '../beneficiarios/entities/beneficiario.entity';
import { Voluntario } from '../voluntarios/entities/voluntario.entity';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';
import { Departamento } from './entities/departamento.entity';
import { Municipio } from './entities/municipio.entity';
import { PermissionsGuard } from '../permissions/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Departamento,
      Municipio,
      Beneficiario,
      Voluntario,
    ]),
  ],
  controllers: [CatalogosController],
  providers: [CatalogosService, PermissionsGuard],
  exports: [CatalogosService],
})
export class CatalogosModule {}
