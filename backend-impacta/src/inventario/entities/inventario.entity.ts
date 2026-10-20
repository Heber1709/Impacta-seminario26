import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Donacion } from '../../donaciones/entities/donaciones.entity';
import { Entrega } from '../../entregas/entities/entregas.entity';

export enum TipoMovimientoInventarioLegacy {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
}

@Entity('inventario_kardex')
export class Inventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TipoMovimientoInventarioLegacy })
  tipo_movimiento: TipoMovimientoInventarioLegacy;

  @Column({ type: 'varchar', length: 30, nullable: true })
  tipo_movimiento_codigo?: string | null;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'date', nullable: true })
  fecha_vencimiento: Date;

  @CreateDateColumn()
  fecha_movimiento: Date;

  @Column({ length: 255, nullable: true })
  observaciones: string;

  @Column({ default: true })
  estado: boolean;

  @ManyToOne(() => Donacion, { eager: true })
  @JoinColumn({ name: 'donacion_id' })
  donacion: Donacion;

  @ManyToOne(() => Entrega, { eager: true, nullable: true })
  @JoinColumn({ name: 'entrega_id' })
  entrega?: Entrega | null;
}