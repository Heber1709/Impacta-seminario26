import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    // Validar que el correo no esté duplicado
    const existe = await this.usuarioRepository.findOneBy({ email: createUsuarioDto.email });
    if (existe) {
      throw new BadRequestException('El usuario con este correo ya existe en Impacta');
    }

    const nuevoUsuario = this.usuarioRepository.create(createUsuarioDto);
    return await this.usuarioRepository.save(nuevoUsuario);
  }

  async findAll() {
    // Devuelve todos los usuarios activos
    return await this.usuarioRepository.find({ where: { estado: true } });
  }

  async findOne(id: string) {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`No se encontró el usuario ${id}`);
    }

    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);

    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const existe = await this.usuarioRepository.findOneBy({ email: updateUsuarioDto.email });
      if (existe) {
        throw new BadRequestException('El usuario con este correo ya existe en Impacta');
      }
    }

    Object.assign(usuario, updateUsuarioDto);
    return await this.usuarioRepository.save(usuario);
  }

  async remove(id: string) {
    const usuario = await this.findOne(id);
    usuario.estado = false;
    return await this.usuarioRepository.save(usuario);
  }
  async findByEmail(email: string) {
    return await this.usuarioRepository.findOne({ where: { email, estado: true } });
  }
}