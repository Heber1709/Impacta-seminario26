import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdatePerfilDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;
}
