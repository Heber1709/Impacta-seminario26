import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDepartamentoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo_departamento: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descripcion: string;
}
