import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEntregaDto } from './dto/create-entregas.dto';
import { UpdateEntregasDto } from './dto/update-entregas.dto';
import { Entrega } from './entities/entregas.entity';

@Injectable()
export class EntregasService {
  constructor(
    @InjectRepository(Entrega)
    private readonly entregaRepository: Repository<Entrega>,
  ) {}

  async create(createEntregaDto: CreateEntregaDto) {
    const nueva = this.entregaRepository.create({
      ...createEntregaDto,
      beneficiario: { id: createEntregaDto.beneficiario_id },
      usuario: { id: createEntregaDto.usuario_id },
      ...(createEntregaDto.campana_id && {
        campana: { id: createEntregaDto.campana_id },
      }),
    });
    return await this.entregaRepository.save(nueva);
  }

  async findAll() {
    return await this.entregaRepository.find({ where: { estado: true } });
  }

  async findOne(id: string) {
    const entrega = await this.entregaRepository.findOne({ where: { id, estado: true } });
    if (!entrega) throw new NotFoundException('Entrega no encontrada');
    return entrega;
  }

  async update(id: string, updateEntregasDto: UpdateEntregasDto) {
    await this.findOne(id);

    const dataToUpdate: any = { ...updateEntregasDto };
    if (updateEntregasDto.beneficiario_id) dataToUpdate.beneficiario = { id: updateEntregasDto.beneficiario_id };
    if (updateEntregasDto.usuario_id) dataToUpdate.usuario = { id: updateEntregasDto.usuario_id };
    if (updateEntregasDto.campana_id) dataToUpdate.campana = { id: updateEntregasDto.campana_id };

    delete dataToUpdate.beneficiario_id;
    delete dataToUpdate.usuario_id;
    delete dataToUpdate.campana_id;

    await this.entregaRepository.update(id, dataToUpdate);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.entregaRepository.update(id, { estado: false });
    return { message: 'Entrega desactivada correctamente' };
  }
}