import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Departamento } from './departamento.entity';

@Entity('municipios')
export class Municipio {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  codigo_municipio: string;

  @Column({ type: 'varchar', length: 100 })
  descripcion: string;

  @Column({ type: 'varchar', length: 20 })
  codigo_departamento: string;

  @ManyToOne(() => Departamento, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'codigo_departamento',
    referencedColumnName: 'codigo_departamento',
  })
  departamento: Departamento;
}
