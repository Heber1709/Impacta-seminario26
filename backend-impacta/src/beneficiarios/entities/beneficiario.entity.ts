import { Departamento } from '../../catalogos/entities/departamento.entity';
import { Municipio } from '../../catalogos/entities/municipio.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('beneficiarios')
export class Beneficiario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 13 })
  dpi: string;

  @Column({ length: 200 })
  nombre_completo: string;

  @Column({ length: 255 })
  direccion: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  codigo_departamento: string | null;

  @ManyToOne(() => Departamento, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'codigo_departamento',
    referencedColumnName: 'codigo_departamento',
  })
  departamentoCatalogo: Departamento | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  codigo_municipio: string | null;

  @ManyToOne(() => Municipio, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'codigo_municipio',
    referencedColumnName: 'codigo_municipio',
  })
  municipioCatalogo: Municipio | null;

  @Column({ type: 'int' })
  integrantes_hogar: number;

  @Column({ default: true })
  estado: boolean;
}