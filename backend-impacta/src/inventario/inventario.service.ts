import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import {
  Inventario,
  TipoMovimientoInventarioLegacy,
} from './entities/inventario.entity';
import { Entrega } from '../entregas/entities/entregas.entity';
import { TipoMovimiento } from '../tipos-movimiento/entities/tipo-movimiento.entity';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,
    @InjectRepository(Entrega)
    private readonly entregaRepository: Repository<Entrega>,
    @InjectRepository(TipoMovimiento)
    private readonly tipoMovimientoRepository: Repository<TipoMovimiento>,
  ) {}

  async create(createInventarioDto: CreateInventarioDto) {
    const tipoMovimiento = await this.findTipoMovimiento(
      createInventarioDto.tipo_movimiento,
    );
    const entrega = await this.findEntregaByNumero(
      createInventarioDto.numero_entrega,
    );

    if (tipoMovimiento.signo === '-') {
      const existencias = await this.calcularExistencias(
        createInventarioDto.donacion_id,
      );
      this.validarExistencias(
        createInventarioDto.cantidad,
        existencias,
      );
    }

    const nuevoMovimiento = this.inventarioRepository.create({
      tipo_movimiento:
        tipoMovimiento.signo === '+'
          ? TipoMovimientoInventarioLegacy.ENTRADA
          : TipoMovimientoInventarioLegacy.SALIDA,
      tipo_movimiento_codigo: tipoMovimiento.codigo,
      cantidad: createInventarioDto.cantidad,
      fecha_vencimiento: createInventarioDto.fecha_vencimiento,
      observaciones: createInventarioDto.observaciones,
      donacion: { id: createInventarioDto.donacion_id },
      entrega,
    });

    const guardado = await this.inventarioRepository.save(nuevoMovimiento);
    return {
      ...guardado,
      tipo_movimiento: tipoMovimiento.codigo,
    };
  }

  async findAll() {
    const movimientos = await this.inventarioRepository.find({
      where: { estado: true },
    });
    return movimientos.map((movimiento) => ({
      ...movimiento,
      tipo_movimiento:
        movimiento.tipo_movimiento_codigo ?? movimiento.tipo_movimiento,
    }));
  }

  async findOne(id: string) {
    const movimiento = await this.findOneEntity(id);
    return {
      ...movimiento,
      tipo_movimiento:
        movimiento.tipo_movimiento_codigo ?? movimiento.tipo_movimiento,
    };
  }

  private async findOneEntity(id: string) {
    const movimiento = await this.inventarioRepository.findOne({
      where: { id, estado: true },
    });
    if (!movimiento) throw new NotFoundException('Movimiento de inventario no encontrado');
    return movimiento;
  }

  async update(id: string, updateInventarioDto: UpdateInventarioDto) {
    const movimientoActual = await this.findOneEntity(id);

    const tipoMovimientoCodigo =
      updateInventarioDto.tipo_movimiento ??
      movimientoActual.tipo_movimiento_codigo ??
      movimientoActual.tipo_movimiento;
    const tipoMovimiento = await this.findTipoMovimiento(tipoMovimientoCodigo);

    const cantidad =
      updateInventarioDto.cantidad ?? movimientoActual.cantidad;

    const donacionId =
      updateInventarioDto.donacion_id ?? movimientoActual.donacion.id;

    if (tipoMovimiento.signo === '-') {
      const existencias = await this.calcularExistencias(donacionId, id);
      this.validarExistencias(cantidad, existencias);
    }

    const {
      donacion_id,
      numero_entrega,
      tipo_movimiento: _tipoMovimiento,
      ...dataToUpdate
    } =
      updateInventarioDto;
    const entrega =
      numero_entrega !== undefined
        ? await this.findEntregaByNumero(numero_entrega)
        : undefined;

    const legacyTipo =
      tipoMovimiento.signo === '+'
        ? TipoMovimientoInventarioLegacy.ENTRADA
        : TipoMovimientoInventarioLegacy.SALIDA;
    await this.inventarioRepository.update(id, {
      ...dataToUpdate,
      tipo_movimiento: legacyTipo,
      tipo_movimiento_codigo: tipoMovimiento.codigo,
    });

    if (donacion_id) {
      await this.inventarioRepository
        .createQueryBuilder()
        .relation(Inventario, 'donacion')
        .of(id)
        .set(donacion_id);
    }

    if (entrega) {
      await this.inventarioRepository
        .createQueryBuilder()
        .relation(Inventario, 'entrega')
        .of(id)
        .set(entrega.id);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.inventarioRepository.update(id, { estado: false });
    return { message: 'Movimiento de inventario desactivado correctamente' };
  }

  private async findEntregaByNumero(numeroEntrega: number) {
    const entrega = await this.entregaRepository.findOne({
      where: { numero_entrega: numeroEntrega, estado: true },
    });
    if (!entrega) {
      throw new NotFoundException(
        `No existe una entrega activa con el número ${numeroEntrega}.`,
      );
    }
    return entrega;
  }

  private async findTipoMovimiento(codigo: string) {
    const tipo = await this.tipoMovimientoRepository.findOne({
      where: { codigo, estado: true },
    });
    if (!tipo) {
      throw new NotFoundException(
        `No existe un tipo de movimiento activo con el código ${codigo}.`,
      );
    }
    return tipo;
  }

  private async calcularExistencias(donacionId: string, excluirId?: string) {
    const movimientos = await this.inventarioRepository.find({
      where: { estado: true, donacion: { id: donacionId } },
    });
    if (movimientos.length === 0) return 0;

    const tipos = await this.tipoMovimientoRepository.find({
      where: movimientos.map(({ tipo_movimiento, tipo_movimiento_codigo }) => ({
        codigo: tipo_movimiento_codigo ?? tipo_movimiento,
      })),
    });
    const signos = new Map(tipos.map(({ codigo, signo }) => [codigo, signo]));

    return movimientos.reduce((existencias, movimiento) => {
      if (movimiento.id === excluirId) return existencias;
      const codigoTipo =
        movimiento.tipo_movimiento_codigo ?? movimiento.tipo_movimiento;
      const factor = signos.get(codigoTipo);
      if (!factor) {
        throw new BadRequestException(
          `El tipo de movimiento ${codigoTipo} ya no está disponible.`,
        );
      }
      return existencias + (factor === '+' ? movimiento.cantidad : -movimiento.cantidad);
    }, 0);
  }

  private validarExistencias(cantidad: number, existencias: number) {
    if (cantidad > existencias) {
      throw new BadRequestException(
        `No hay existencias suficientes. Disponibles: ${existencias}`,
      );
    }
  }
}
