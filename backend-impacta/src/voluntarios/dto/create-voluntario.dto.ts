import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateVoluntarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  dpi: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre_completo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo_departamento: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo_municipio: string;
}
