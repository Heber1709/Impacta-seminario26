import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Beneficiario } from '../../beneficiarios/entities/beneficiario.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Campana } from '../../campanas/entities/campana.entity';
import { Voluntario } from '../../voluntarios/entities/voluntario.entity';

@Entity('entregas')
export class Entrega {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer', unique: true })
  @Generated('increment')
  numero_entrega: number;

  @CreateDateColumn()
  fecha: Date;

  @Column({ length: 255, nullable: true })
  evidencia_url: string;

  @Column({ type: 'text', nullable: true })
  firma_digital: string;

  @Column({ default: true })
  estado: boolean;

  @ManyToOne(() => Beneficiario, { eager: true })
  @JoinColumn({ name: 'beneficiario_id' })
  beneficiario: Beneficiario;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Campana, { eager: true, nullable: true })
  @JoinColumn({ name: 'campana_id' })
  campana?: Campana;

  @ManyToMany(() => Voluntario)
  @JoinTable({
    name: 'entrega_voluntarios',
    joinColumn: { name: 'entrega_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'voluntario_id', referencedColumnName: 'id' },
  })
  voluntarios: Voluntario[];
}