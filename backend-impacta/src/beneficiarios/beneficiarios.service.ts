import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogosService } from '../catalogos/catalogos.service';
import { CreateBeneficiarioDto } from './dto/create-beneficiario.dto';
import { UpdateBeneficiarioDto } from './dto/update-beneficiario.dto';
import { Beneficiario } from './entities/beneficiario.entity';

@Injectable()
export class BeneficiariosService {
  constructor(
    @InjectRepository(Beneficiario)
    private readonly beneficiarioRepository: Repository<Beneficiario>,
    private readonly catalogosService: CatalogosService,
  ) {}

  async create(createBeneficiarioDto: CreateBeneficiarioDto) {
    const existe = await this.beneficiarioRepository.findOneBy({ dpi: createBeneficiarioDto.dpi });
    if (existe) {
      throw new BadRequestException('Ya existe un beneficiario registrado con este DPI');
    }
    const ubicacion = await this.catalogosService.resolverUbicacion(
      createBeneficiarioDto.codigo_departamento,
      createBeneficiarioDto.codigo_municipio,
    );
    const nuevo = this.beneficiarioRepository.create({
      ...createBeneficiarioDto,
      ...ubicacion,
    });
    return await this.beneficiarioRepository.save(nuevo);
  }

  async findAll() {
    return await this.beneficiarioRepository.find({ where: { estado: true } });
  }

  async findOne(id: string) {
    const beneficiario = await this.beneficiarioRepository.findOne({ where: { id, estado: true } });
    if (!beneficiario) throw new NotFoundException('Beneficiario no encontrado');
    return beneficiario;
  }

  async update(id: string, updateBeneficiarioDto: UpdateBeneficiarioDto) {
    await this.findOne(id); // Valida que exista primero
    const ubicacion = await this.catalogosService.resolverUbicacion(
      updateBeneficiarioDto.codigo_departamento,
      updateBeneficiarioDto.codigo_municipio,
    );
    await this.beneficiarioRepository.update(id, {
      ...updateBeneficiarioDto,
      ...ubicacion,
    });
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.beneficiarioRepository.update(id, { estado: false });
    return { message: 'Beneficiario desactivado correctamente' };
  }
}