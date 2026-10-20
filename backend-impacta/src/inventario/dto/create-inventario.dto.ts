import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateInventarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  tipo_movimiento: string;

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

  @IsInt()
  @Min(1, { message: 'El número de entrega debe ser al menos 1' })
  numero_entrega: number;
}