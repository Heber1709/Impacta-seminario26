import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampanasService } from './campanas.service';
import { CampanasController } from './campanas.controller';
import { Campana } from './entities/campana.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campana])],
  controllers: [CampanasController],
  providers: [CampanasService],
})
export class CampanasModule {}