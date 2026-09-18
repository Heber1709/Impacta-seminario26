import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { RolUsuario } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsEnum(RolUsuario, { message: 'El rol debe ser ADMINISTRADOR, COORDINADOR o VOLUNTARIO' })
  @IsNotEmpty()
  rol: RolUsuario;
}