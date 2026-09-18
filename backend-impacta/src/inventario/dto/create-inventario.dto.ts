import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TipoMovimiento } from '../entities/inventario.entity';

export class CreateInventarioDto {
  @IsEnum(TipoMovimiento, { message: 'El movimiento debe ser ENTRADA o SALIDA' })
  @IsNotEmpty()
  tipo_movimiento: TipoMovimiento;

  @IsInt()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  cantidad: number;

  @IsDateString({}, { message: 'Debe ser una fecha válida (YYYY-MM-DD)' })
  @IsOptional()
  fecha_vencimiento?: Date;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsUUID()
  @IsNotEmpty()
  donacion_id: string; // UUID de la tabla donaciones
}