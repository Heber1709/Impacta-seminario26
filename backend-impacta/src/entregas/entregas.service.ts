import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateEntregaDto } from './dto/create-entregas.dto';
import { UpdateEntregasDto } from './dto/update-entregas.dto';
import { Entrega } from './entities/entregas.entity';
import { Voluntario } from '../voluntarios/entities/voluntario.entity';

@Injectable()
export class EntregasService {
  constructor(
    @InjectRepository(Entrega)
    private readonly entregaRepository: Repository<Entrega>,
    @InjectRepository(Voluntario)
    private readonly voluntarioRepository: Repository<Voluntario>,
  ) {}

  async create(createEntregaDto: CreateEntregaDto) {
    const {
      beneficiario_id,
      usuario_id,
      campana_id,
      voluntarios_ids = [],
      ...entregaData
    } = createEntregaDto;
    const voluntarios = await this.resolveVoluntarios(voluntarios_ids);
    const nueva = this.entregaRepository.create({
      ...entregaData,
      beneficiario: { id: beneficiario_id },
      usuario: { id: usuario_id },
      ...(campana_id && { campana: { id: campana_id } }),
      voluntarios,
    });
    const guardada = await this.entregaRepository.save(nueva);
    return {
      ...guardada,
      voluntarios: voluntarios.map(({ id }) => ({ id })),
    };
  }

  async findAll() {
    return this.entregaRepository.find({
      where: { estado: true },
      loadRelationIds: { relations: ['voluntarios'] },
    });
  }

  async findOne(id: string) {
    const entrega = await this.findEntity(id);
    const voluntarios = await this.entregaRepository
      .createQueryBuilder()
      .relation(Entrega, 'voluntarios')
      .of(id)
      .loadMany<Voluntario>();
    return {
      ...entrega,
      voluntarios: voluntarios.map(({ id: voluntarioId }) => ({
        id: voluntarioId,
      })),
    };
  }

  async update(id: string, updateEntregasDto: UpdateEntregasDto) {
    const entrega = await this.findEntity(id);
    const {
      beneficiario_id,
      usuario_id,
      campana_id,
      voluntarios_ids,
      ...entregaData
    } = updateEntregasDto;

    Object.assign(entrega, entregaData);
    if (voluntarios_ids !== undefined) {
      entrega.voluntarios = await this.resolveVoluntarios(voluntarios_ids);
    }

    await this.entregaRepository.save(entrega);

    if (beneficiario_id) {
      await this.entregaRepository
        .createQueryBuilder()
        .relation(Entrega, 'beneficiario')
        .of(id)
        .set(beneficiario_id);
    }
    if (usuario_id) {
      await this.entregaRepository
        .createQueryBuilder()
        .relation(Entrega, 'usuario')
        .of(id)
        .set(usuario_id);
    }
    if (campana_id !== undefined) {
      await this.entregaRepository
        .createQueryBuilder()
        .relation(Entrega, 'campana')
        .of(id)
        .set(campana_id);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findEntity(id);
    await this.entregaRepository.update(id, { estado: false });
    return { message: 'Entrega desactivada correctamente' };
  }

  private async resolveVoluntarios(ids: string[]) {
    if (ids.length === 0) return [];

    const voluntarios = await this.voluntarioRepository.find({
      where: { id: In(ids), estado: true },
    });
    if (voluntarios.length !== ids.length) {
      throw new NotFoundException(
        'Uno o más voluntarios no existen o están inactivos.',
      );
    }
    return voluntarios;
  }

  private async findEntity(id: string) {
    const entrega = await this.entregaRepository.findOne({
      where: { id, estado: true },
    });
    if (!entrega) throw new NotFoundException('Entrega no encontrada');
    return entrega;
  }
}