import {
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateTipoMovimientoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'El código solo puede contener letras mayúsculas, números, _ y -',
  })
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descripcion: string;

  @IsIn(['+', '-'], { message: 'El signo debe ser + o -' })
  signo: '+' | '-';
}
