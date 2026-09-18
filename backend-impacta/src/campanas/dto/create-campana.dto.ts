import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCampanaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  objetivo: string;

  @IsDateString({}, { message: 'Debe ser una fecha válida (YYYY-MM-DD)' })
  @IsNotEmpty()
  fecha_inicio: Date;

  @IsDateString({}, { message: 'Debe ser una fecha válida (YYYY-MM-DD)' })
  @IsOptional()
  fecha_fin?: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  meta_economica?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  meta_productos?: number;
}