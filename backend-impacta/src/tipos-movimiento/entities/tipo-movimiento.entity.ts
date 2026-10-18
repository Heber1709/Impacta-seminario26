import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('tipos_movimiento')
export class TipoMovimiento {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  codigo: string;

  @Column({ type: 'varchar', length: 100 })
  descripcion: string;

  @Column({ type: 'char', length: 1 })
  signo: '+' | '-';

  @Column({ default: true })
  estado: boolean;
}
