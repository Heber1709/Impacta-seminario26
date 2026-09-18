import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Donante } from '../../donantes/entities/donante.entity';

export enum TipoDonacion {
  MONETARIA = 'MONETARIA',
  FISICA = 'FISICA',
}

export enum CategoriaDonacion {
  ALIMENTOS = 'ALIMENTOS',
  MEDICAMENTOS = 'MEDICAMENTOS',
  ROPA = 'ROPA',
  MOBILIARIO = 'MOBILIARIO',
  EQUIPO_TECNOLOGICO = 'EQUIPO_TECNOLOGICO',
  MATERIAL_EDUCATIVO = 'MATERIAL_EDUCATIVO',
  FINANCIERA = 'FINANCIERA', // Para depósitos/transferencias
}

@Entity('donaciones')
export class Donacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  codigo_unico: string;

  @Column({ type: 'enum', enum: TipoDonacion })
  tipo: TipoDonacion;

  @Column({ type: 'enum', enum: CategoriaDonacion })
  categoria: CategoriaDonacion;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monto: number;

  @Column({ length: 255, nullable: true })
  fotografia_url: string;

  @CreateDateColumn()
  fecha_ingreso: Date;

  @Column({ default: true })
  estado: boolean;

  // Relación de Muchos a Uno con Donantes
  @ManyToOne(() => Donante, { eager: true })
  @JoinColumn({ name: 'donante_id' })
  donante: Donante;
}