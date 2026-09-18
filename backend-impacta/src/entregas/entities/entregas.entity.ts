import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Beneficiario } from '../../beneficiarios/entities/beneficiario.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Campana } from '../../campanas/entities/campana.entity';

@Entity('entregas')
export class Entrega {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
}