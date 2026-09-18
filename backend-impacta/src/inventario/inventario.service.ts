import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { Inventario } from './entities/inventario.entity';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,
  ) {}

  async create(createInventarioDto: CreateInventarioDto) {
    const nuevoMovimiento = this.inventarioRepository.create({
      ...createInventarioDto,
      donacion: { id: createInventarioDto.donacion_id },
    });
    return await this.inventarioRepository.save(nuevoMovimiento);
  }

  async findAll() {
    return await this.inventarioRepository.find({ where: { estado: true } });
  }

  async findOne(id: string) {
    const movimiento = await this.inventarioRepository.findOne({ where: { id, estado: true } });
    if (!movimiento) throw new NotFoundException('Movimiento de inventario no encontrado');
    return movimiento;
  }

  async update(id: string, updateInventarioDto: UpdateInventarioDto) {
    await this.findOne(id);
    
    const dataToUpdate: any = { ...updateInventarioDto };
    if (updateInventarioDto.donacion_id) {
      dataToUpdate.donacion = { id: updateInventarioDto.donacion_id };
      delete dataToUpdate.donacion_id;
    }

    await this.inventarioRepository.update(id, dataToUpdate);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.inventarioRepository.update(id, { estado: false });
    return { message: 'Movimiento de inventario desactivado correctamente' };
  }
}