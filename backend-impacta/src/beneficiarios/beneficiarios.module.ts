import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiariosService } from './beneficiarios.service';
import { BeneficiariosController } from './beneficiarios.controller';
import { Beneficiario } from './entities/beneficiario.entity';
import { CatalogosModule } from '../catalogos/catalogos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Beneficiario]), CatalogosModule],
  controllers: [BeneficiariosController],
  providers: [BeneficiariosService],
})
export class BeneficiariosModule {}