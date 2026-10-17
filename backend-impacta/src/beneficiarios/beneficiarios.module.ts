import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiariosService } from './beneficiarios.service';
import { BeneficiariosController } from './beneficiarios.controller';
import { Beneficiario } from './entities/beneficiario.entity';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { PermissionsGuard } from '../permissions/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Beneficiario]), CatalogosModule],
  controllers: [BeneficiariosController],
  providers: [BeneficiariosService, PermissionsGuard],
})
export class BeneficiariosModule {}