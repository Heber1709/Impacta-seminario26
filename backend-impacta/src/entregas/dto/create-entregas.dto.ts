import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEntregaDto {
  @IsString()
  @IsOptional()
  evidencia_url?: string;

  @IsString()
  @IsOptional()
  firma_digital?: string;

  @IsUUID()
  @IsNotEmpty()
  beneficiario_id: string;

  @IsUUID()
  @IsNotEmpty()
  usuario_id: string;

  @IsUUID()
  @IsOptional()
  campana_id?: string | null;

  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  @IsOptional()
  voluntarios_ids?: string[];
}