import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCampanaDto } from './dto/create-campana.dto';
import { UpdateCampanaDto } from './dto/update-campana.dto';
import { Campana } from './entities/campana.entity';

@Injectable()
export class CampanasService {
  constructor(
    @InjectRepository(Campana)
    private readonly campanaRepository: Repository<Campana>,
  ) {}

  async create(createCampanaDto: CreateCampanaDto) {
    const nueva = this.campanaRepository.create(createCampanaDto);
    return await this.campanaRepository.save(nueva);
  }

  async findAll() {
    return await this.campanaRepository.find({ where: { estado: true } });
  }

  async findOne(id: string) {
    const campana = await this.campanaRepository.findOne({ where: { id, estado: true } });
    if (!campana) throw new NotFoundException('Campaña no encontrada');
    return campana;
  }

  async update(id: string, updateCampanaDto: UpdateCampanaDto) {
    await this.findOne(id);
    await this.campanaRepository.update(id, updateCampanaDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.campanaRepository.update(id, { estado: false });
    return { message: 'Campaña desactivada correctamente' };
  }
}
