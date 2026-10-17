import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiario } from '../beneficiarios/entities/beneficiario.entity';
import { Voluntario } from '../voluntarios/entities/voluntario.entity';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';
import { Departamento } from './entities/departamento.entity';
import { Municipio } from './entities/municipio.entity';

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
  providers: [CatalogosService],
  exports: [CatalogosService],
})
export class CatalogosModule {}
