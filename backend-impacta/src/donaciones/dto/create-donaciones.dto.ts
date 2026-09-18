import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { CategoriaDonacion, TipoDonacion } from '../entities/donaciones.entity';

export class CreateDonacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo_unico: string;

  @IsEnum(TipoDonacion, { message: 'El tipo debe ser MONETARIA o FISICA' })
  @IsNotEmpty()
  tipo: TipoDonacion;

  @IsEnum(CategoriaDonacion)
  @IsNotEmpty()
  categoria: CategoriaDonacion;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  monto?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  fotografia_url?: string;

  @IsUUID()
  @IsNotEmpty()
  donante_id: string; // El UUID que viene desde el frontend
}