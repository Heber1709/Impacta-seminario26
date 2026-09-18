import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ length: 100 })
  municipio: string;

  @Column({ length: 100 })
  departamento: string;

  @Column({ type: 'int' })
  integrantes_hogar: number;

  @Column({ default: true })
  estado: boolean;
}