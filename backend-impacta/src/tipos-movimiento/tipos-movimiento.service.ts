import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Inventario,
  TipoMovimientoInventarioLegacy,
} from '../inventario/entities/inventario.entity';
import { CreateTipoMovimientoDto } from './dto/create-tipo-movimiento.dto';
import { UpdateTipoMovimientoDto } from './dto/update-tipo-movimiento.dto';
import { TipoMovimiento } from './entities/tipo-movimiento.entity';

@Injectable()
export class TiposMovimientoService implements OnModuleInit {
  constructor(
    @InjectRepository(TipoMovimiento)
    private readonly tipoMovimientoRepository: Repository<TipoMovimiento>,
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,
  ) {}

  async onModuleInit() {
    const tiposPredeterminados: CreateTipoMovimientoDto[] = [
      { codigo: 'ENTRADA', descripcion: 'Entrada', signo: '+' },
      { codigo: 'SALIDA', descripcion: 'Salida', signo: '-' },
    ];

    for (const tipo of tiposPredeterminados) {
      const existente = await this.tipoMovimientoRepository.findOneBy({
        codigo: tipo.codigo,
      });
      if (!existente) {
        await this.tipoMovimientoRepository.save(
          this.tipoMovimientoRepository.create(tipo),
        );
      }
    }
  }

  async create(dto: CreateTipoMovimientoDto) {
    const existing = await this.tipoMovimientoRepository.findOneBy({
      codigo: dto.codigo,
    });
    if (existing) {
      throw new ConflictException('Ya existe un tipo de movimiento con ese código.');
    }
    return this.tipoMovimientoRepository.save(
      this.tipoMovimientoRepository.create(dto),
    );
  }

  async findAll() {
    return this.tipoMovimientoRepository.find({
      where: { estado: true },
      order: { descripcion: 'ASC' },
    });
  }

  async findOne(codigo: string) {
    const tipo = await this.tipoMovimientoRepository.findOne({
      where: { codigo, estado: true },
    });
    if (!tipo) {
      throw new NotFoundException('Tipo de movimiento no encontrado.');
    }
    return tipo;
  }

  async update(codigo: string, dto: UpdateTipoMovimientoDto) {
    const tipo = await this.findOne(codigo);
    const { codigo: _codigo, ...data } = dto;
    if (data.signo && data.signo !== tipo.signo) {
      const movimientosAsociados = await this.inventarioRepository.count({
        where:
          codigo === 'ENTRADA'
            ? [
                { tipo_movimiento_codigo: codigo },
                {
                  tipo_movimiento:
                    TipoMovimientoInventarioLegacy.ENTRADA,
                },
              ]
            : codigo === 'SALIDA'
              ? [
                  { tipo_movimiento_codigo: codigo },
                  {
                    tipo_movimiento: TipoMovimientoInventarioLegacy.SALIDA,
                  },
                ]
              : { tipo_movimiento_codigo: codigo },
      });
      if (movimientosAsociados > 0) {
        throw new ConflictException(
          'No se puede cambiar el signo de un tipo de movimiento que ya está en uso.',
        );
      }
    }
    await this.tipoMovimientoRepository.update(codigo, data);
    return this.findOne(codigo);
  }

  async remove(codigo: string) {
    const tipo = await this.findOne(codigo);
    if (tipo.codigo === 'ENTRADA' || tipo.codigo === 'SALIDA') {
      throw new ConflictException(
        'Los tipos de movimiento predeterminados no se pueden desactivar.',
      );
    }
    const movimientosAsociados = await this.inventarioRepository.count({
      where: { tipo_movimiento_codigo: codigo },
    });
    if (movimientosAsociados > 0) {
      throw new ConflictException(
        'No se puede desactivar un tipo de movimiento que ya está en uso.',
      );
    }
    await this.tipoMovimientoRepository.update(codigo, { estado: false });
    return { message: 'Tipo de movimiento desactivado correctamente.' };
  }
}
