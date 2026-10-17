import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMunicipioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo_municipio: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo_departamento: string;
}
