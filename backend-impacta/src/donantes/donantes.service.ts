import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';
import { Donante } from './entities/donante.entity';

@Injectable()
export class DonantesService {
  constructor(
    @InjectRepository(Donante)
    private readonly donanteRepository: Repository<Donante>,
  ) {}

  async create(createDonanteDto: CreateDonanteDto) {
    const nuevo = this.donanteRepository.create(createDonanteDto);
    return await this.donanteRepository.save(nuevo);
  }

  async findAll() {
    return await this.donanteRepository.find({ where: { estado: true } });
  }

  async findOne(id: string) {
    const donante = await this.donanteRepository.findOne({ where: { id, estado: true } });
    if (!donante) throw new NotFoundException('Donante no encontrado');
    return donante;
  }

  async update(id: string, updateDonanteDto: UpdateDonanteDto) {
    await this.findOne(id); // Valida que exista
    await this.donanteRepository.update(id, updateDonanteDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.donanteRepository.update(id, { estado: false });
    return { message: 'Donante desactivado correctamente' };
  }
}