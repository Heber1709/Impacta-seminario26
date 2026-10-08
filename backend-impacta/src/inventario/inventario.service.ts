import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { Inventario, TipoMovimiento } from './entities/inventario.entity';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,
  ) {}

async create(createInventarioDto: CreateInventarioDto) {
  if (createInventarioDto.tipo_movimiento === TipoMovimiento.SALIDA) {
    const movimientos = await this.inventarioRepository.find({
      where: {
        estado: true,
        donacion: { id: createInventarioDto.donacion_id },
      },
    });

    let existencias = 0;

    for (const movimiento of movimientos) {
      if (movimiento.tipo_movimiento === TipoMovimiento.ENTRADA) {
        existencias += movimiento.cantidad;
      }

      if (movimiento.tipo_movimiento === TipoMovimiento.SALIDA) {
        existencias -= movimiento.cantidad;
      }
    }

    if (createInventarioDto.cantidad > existencias) {
      throw new BadRequestException(
        `No hay existencias suficientes. Disponibles: ${existencias}`,
      );
    }
  }

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
  const movimientoActual = await this.findOne(id);

  const tipoMovimiento =
    updateInventarioDto.tipo_movimiento ?? movimientoActual.tipo_movimiento;

  const cantidad =
    updateInventarioDto.cantidad ?? movimientoActual.cantidad;

  const donacionId =
    updateInventarioDto.donacion_id ?? movimientoActual.donacion.id;

  if (tipoMovimiento === TipoMovimiento.SALIDA) {
    const movimientos = await this.inventarioRepository.find({
      where: {
        estado: true,
        donacion: { id: donacionId },
      },
    });

    let existencias = 0;

    for (const movimiento of movimientos) {
      if (movimiento.id === id) {
        continue;
      }

      if (movimiento.tipo_movimiento === TipoMovimiento.ENTRADA) {
        existencias += movimiento.cantidad;
      }

      if (movimiento.tipo_movimiento === TipoMovimiento.SALIDA) {
        existencias -= movimiento.cantidad;
      }
    }

    if (cantidad > existencias) {
      throw new BadRequestException(
        `No hay existencias suficientes. Disponibles: ${existencias}`,
      );
    }
  }

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
