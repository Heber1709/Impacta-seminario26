import { Departamento } from '../../catalogos/entities/departamento.entity';
import { Municipio } from '../../catalogos/entities/municipio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('voluntarios')
export class Voluntario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 13 })
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

  @Column({ default: true })
  estado: boolean;
}
