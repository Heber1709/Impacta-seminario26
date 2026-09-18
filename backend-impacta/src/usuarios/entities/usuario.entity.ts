import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum RolUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  COORDINADOR = 'COORDINADOR',
  VOLUNTARIO = 'VOLUNTARIO',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.VOLUNTARIO })
  rol: RolUsuario;

  @Column({ default: true })
  estado: boolean;
}