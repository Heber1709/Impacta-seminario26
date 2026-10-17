import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiario } from '../beneficiarios/entities/beneficiario.entity';
import { Voluntario } from '../voluntarios/entities/voluntario.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { Departamento } from './entities/departamento.entity';
import { Municipio } from './entities/municipio.entity';

@Injectable()
export class CatalogosService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
    @InjectRepository(Beneficiario)
    private readonly beneficiarioRepository: Repository<Beneficiario>,
    @InjectRepository(Voluntario)
    private readonly voluntarioRepository: Repository<Voluntario>,
  ) {}

  findDepartamentos() {
    return this.departamentoRepository.find({
      order: { descripcion: 'ASC', codigo_departamento: 'ASC' },
    });
  }

  findMunicipios(codigoDepartamento?: string) {
    return this.municipioRepository.find({
      where: codigoDepartamento
        ? { codigo_departamento: codigoDepartamento }
        : undefined,
      order: { descripcion: 'ASC', codigo_municipio: 'ASC' },
    });
  }

  async createDepartamento(dto: CreateDepartamentoDto) {
    if (
      await this.departamentoRepository.findOneBy({
        codigo_departamento: dto.codigo_departamento,
      })
    ) {
      throw new BadRequestException('El código de departamento ya existe');
    }
    return this.departamentoRepository.save(
      this.departamentoRepository.create(dto),
    );
  }

  async updateDepartamento(
    codigo: string,
    dto: UpdateDepartamentoDto,
  ) {
    const departamento = await this.departamentoRepository.findOneBy({
      codigo_departamento: codigo,
    });
    if (!departamento) {
      throw new NotFoundException('Departamento no encontrado');
    }
    if (dto.codigo_departamento && dto.codigo_departamento !== codigo) {
      throw new BadRequestException(
        'El código no se puede cambiar después de crear el departamento',
      );
    }
    const descripcion = dto.descripcion ?? departamento.descripcion;
    await this.departamentoRepository.update(codigo, { descripcion });
    return this.departamentoRepository.findOneByOrFail({
      codigo_departamento: codigo,
    });
  }

  async removeDepartamento(codigo: string) {
    const departamento = await this.departamentoRepository.findOneBy({
      codigo_departamento: codigo,
    });
    if (!departamento) {
      throw new NotFoundException('Departamento no encontrado');
    }

    const municipios = await this.municipioRepository.countBy({
      codigo_departamento: codigo,
    });
    const beneficiarios = await this.beneficiarioRepository.countBy({
      codigo_departamento: codigo,
    });
    const voluntarios = await this.voluntarioRepository.countBy({
      codigo_departamento: codigo,
    });
    if (municipios + beneficiarios + voluntarios > 0) {
      throw new BadRequestException(
        'No se puede eliminar el departamento porque tiene municipios o personas asociadas',
      );
    }

    await this.departamentoRepository.delete(codigo);
    return { message: 'Departamento eliminado correctamente' };
  }

  async createMunicipio(dto: CreateMunicipioDto) {
    await this.requireDepartamento(dto.codigo_departamento);
    if (
      await this.municipioRepository.findOneBy({
        codigo_municipio: dto.codigo_municipio,
      })
    ) {
      throw new BadRequestException('El código de municipio ya existe');
    }
    return this.municipioRepository.save(
      this.municipioRepository.create(dto),
    );
  }

  async updateMunicipio(codigo: string, dto: UpdateMunicipioDto) {
    const municipio = await this.municipioRepository.findOneBy({
      codigo_municipio: codigo,
    });
    if (!municipio) {
      throw new NotFoundException('Municipio no encontrado');
    }
    if (dto.codigo_municipio && dto.codigo_municipio !== codigo) {
      throw new BadRequestException(
        'El código no se puede cambiar después de crear el municipio',
      );
    }
    if (
      dto.codigo_departamento &&
      dto.codigo_departamento !== municipio.codigo_departamento
    ) {
      throw new BadRequestException(
        'El municipio no se puede cambiar de departamento después de crearlo',
      );
    }
    const descripcion = dto.descripcion ?? municipio.descripcion;
    await this.municipioRepository.update(codigo, { descripcion });
    return this.municipioRepository.findOneByOrFail({
      codigo_municipio: codigo,
    });
  }

  async removeMunicipio(codigo: string) {
    const municipio = await this.municipioRepository.findOneBy({
      codigo_municipio: codigo,
    });
    if (!municipio) {
      throw new NotFoundException('Municipio no encontrado');
    }

    const beneficiarios = await this.beneficiarioRepository.countBy({
      codigo_municipio: codigo,
    });
    const voluntarios = await this.voluntarioRepository.countBy({
      codigo_municipio: codigo,
    });
    if (beneficiarios + voluntarios > 0) {
      throw new BadRequestException(
        'No se puede eliminar el municipio porque tiene beneficiarios o voluntarios asociados',
      );
    }

    await this.municipioRepository.delete(codigo);
    return { message: 'Municipio eliminado correctamente' };
  }

  async resolverUbicacion(
    codigoDepartamento?: string,
    codigoMunicipio?: string,
  ): Promise<
    Partial<
      Pick<
        Beneficiario | Voluntario,
        'codigo_departamento' | 'codigo_municipio'
      >
    >
  > {
    if (codigoDepartamento === undefined && codigoMunicipio === undefined) {
      return {};
    }
    if (!codigoDepartamento || !codigoMunicipio) {
      throw new BadRequestException(
        'Debe seleccionar un departamento y un municipio válidos',
      );
    }

    const departamento = await this.requireDepartamento(codigoDepartamento);
    const municipio = await this.municipioRepository.findOneBy({
      codigo_municipio: codigoMunicipio,
      codigo_departamento: codigoDepartamento,
    });
    if (!municipio) {
      throw new BadRequestException(
        'El municipio no pertenece al departamento seleccionado',
      );
    }

    return {
      codigo_departamento: departamento.codigo_departamento,
      codigo_municipio: municipio.codigo_municipio,
    };
  }

  private async requireDepartamento(codigo: string) {
    const departamento = await this.departamentoRepository.findOneBy({
      codigo_departamento: codigo,
    });
    if (!departamento) {
      throw new NotFoundException('Departamento no encontrado');
    }
    return departamento;
  }
}
