import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { UpdateVoluntarioDto } from './dto/update-voluntario.dto';
import { Voluntario } from './entities/voluntario.entity';

@Injectable()
export class VoluntariosService {
  constructor(
    @InjectRepository(Voluntario)
    private readonly voluntarioRepository: Repository<Voluntario>,
  ) {}

  async create(createVoluntarioDto: CreateVoluntarioDto) {
    const nuevo = this.voluntarioRepository.create(createVoluntarioDto);
    return await this.voluntarioRepository.save(nuevo);
  }

  async findAll() {
    return await this.voluntarioRepository.find({ where: { estado: true } });
  }

  async findOne(id: string) {
    const voluntario = await this.voluntarioRepository.findOne({
      where: { id, estado: true },
    });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }
    return voluntario;
  }

  async update(id: string, updateVoluntarioDto: UpdateVoluntarioDto) {
    await this.findOne(id);
    await this.voluntarioRepository.update(id, updateVoluntarioDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.voluntarioRepository.update(id, { estado: false });
    return { message: 'Voluntario desactivado correctamente' };
  }
}
