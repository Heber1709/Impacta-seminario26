import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum TipoDonante {
  INDIVIDUAL = 'INDIVIDUAL',
  EMPRESA = 'EMPRESA',
  FUNDACION = 'FUNDACION',
  INTERNACIONAL = 'INTERNACIONAL',
}

@Entity('donantes')
export class Donante {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'enum', enum: TipoDonante })
  tipo: TipoDonante;

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ default: true })
  estado: boolean;
}