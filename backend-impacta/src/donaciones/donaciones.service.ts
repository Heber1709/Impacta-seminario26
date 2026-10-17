import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDonacionDto } from './dto/create-donaciones.dto';
import { UpdateDonacionesDto } from './dto/update-donaciones.dto';
import { Donacion } from './entities/donaciones.entity';

@Injectable()
export class DonacionesService {
  constructor(
    @InjectRepository(Donacion)
    private readonly donacionRepository: Repository<Donacion>,
  ) {}

  async create(createDonacionDto: CreateDonacionDto) {
    // 1. Validar que el código único no exista
    const existe = await this.donacionRepository.findOneBy({ codigo_unico: createDonacionDto.codigo_unico });
    if (existe) {
      throw new BadRequestException('Ya existe una donación registrada con este código único');
    }

    // 2. Mapear los datos y enlazar la relación con el Donante
    const nueva = this.donacionRepository.create({
      ...createDonacionDto,
      donante: { id: createDonacionDto.donante_id }, // TypeORM hace la conexión automática con esto
    });

    return await this.donacionRepository.save(nueva);
  }

  async findAll() {
    // eager: true en la entidad hará que automáticamente te devuelva los datos del donante
    return await this.donacionRepository.find({ where: { estado: true } });
  }

  async findOne(id: string) {
    const donacion = await this.donacionRepository.findOne({ where: { id, estado: true } });
    if (!donacion) throw new NotFoundException('Donación no encontrada');
    return donacion;
  }

  async update(id: string, updateDonacionesDto: UpdateDonacionesDto) {
    const donacion = await this.findOne(id);
    const { donante_id, ...fieldsToUpdate } = updateDonacionesDto;

    if (
      fieldsToUpdate.codigo_unico &&
      fieldsToUpdate.codigo_unico !== donacion.codigo_unico
    ) {
      const existingCode = await this.donacionRepository.findOneBy({
        codigo_unico: fieldsToUpdate.codigo_unico,
      });
      if (existingCode && existingCode.id !== id) {
        throw new BadRequestException(
          'Ya existe una donación registrada con este código único',
        );
      }
    }

    this.donacionRepository.merge(donacion, fieldsToUpdate);
    if (donante_id !== undefined) {
      this.donacionRepository.merge(donacion, {
        donante: { id: donante_id },
      });
    }
    await this.donacionRepository.save(donacion);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.donacionRepository.update(id, { estado: false });
    return { message: 'Donación desactivada correctamente' };
  }
}