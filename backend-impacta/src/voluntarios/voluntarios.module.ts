import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voluntario } from './entities/voluntario.entity';
import { VoluntariosController } from './voluntarios.controller';
import { VoluntariosService } from './voluntarios.service';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { PermissionsGuard } from '../permissions/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Voluntario]), CatalogosModule],
  controllers: [VoluntariosController],
  providers: [VoluntariosService, PermissionsGuard],
})
export class VoluntariosModule {}
