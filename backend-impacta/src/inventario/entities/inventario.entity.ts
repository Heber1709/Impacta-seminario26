import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Donacion } from '../../donaciones/entities/donaciones.entity';

export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
}

@Entity('inventario_kardex')
export class Inventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TipoMovimiento })
  tipo_movimiento: TipoMovimiento;

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
}