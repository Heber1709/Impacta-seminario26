import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TipoDonante } from '../entities/donante.entity';

export class CreateDonanteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string;

  @IsEnum(TipoDonante, { message: 'El tipo debe ser INDIVIDUAL, EMPRESA, FUNDACION o INTERNACIONAL' })
  @IsNotEmpty()
  tipo: TipoDonante;

  @IsEmail({}, { message: 'Debe ser un correo válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;
}