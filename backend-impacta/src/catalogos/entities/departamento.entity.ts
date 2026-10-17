import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('departamentos')
export class Departamento {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  codigo_departamento: string;

  @Column({ type: 'varchar', length: 100 })
  descripcion: string;
}
