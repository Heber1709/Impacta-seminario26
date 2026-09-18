import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('campanas')
export class Campana {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text' })
  objetivo: string;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: true })
  fecha_fin: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  meta_economica: number;

  @Column({ type: 'int', default: 0 })
  meta_productos: number;

  @CreateDateColumn()
  fecha_creacion: Date;

  @Column({ default: true })
  estado: boolean;
}