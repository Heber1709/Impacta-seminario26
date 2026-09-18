import { PartialType } from '@nestjs/mapped-types';
import { CreateDonacionDto } from './create-donaciones.dto';

export class UpdateDonacionesDto extends PartialType(CreateDonacionDto) {}
