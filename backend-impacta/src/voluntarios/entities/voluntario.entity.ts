import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ length: 100 })
  municipio: string;

  @Column({ length: 100 })
  departamento: string;

  @Column({ default: true })
  estado: boolean;
}
