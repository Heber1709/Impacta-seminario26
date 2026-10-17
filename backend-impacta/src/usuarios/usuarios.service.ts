import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import {
  permissionSections,
  UserPermissions,
} from '../permissions/permissions.types';

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

    if (
      usuario.estado &&
      usuario.rol === 'ADMINISTRADOR' &&
      updateUsuarioDto.rol &&
      updateUsuarioDto.rol !== 'ADMINISTRADOR'
    ) {
      const administradoresActivos = await this.usuarioRepository.count({
        where: {
          rol: 'ADMINISTRADOR' as any,
          estado: true,
        },
      });

      if (administradoresActivos <= 1) {
        throw new BadRequestException(
          'No se puede cambiar el rol del último administrador activo.',
        );
      }
    }
    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const existe = await this.usuarioRepository.findOneBy({ email: updateUsuarioDto.email });
      if (existe) {
        throw new BadRequestException('El usuario con este correo ya existe en Impacta');
      }
    }

    Object.assign(usuario, updateUsuarioDto);
    return await this.usuarioRepository.save(usuario);
  }

  async findPermissions(id: string) {
    const usuario = await this.findOne(id);
    return { id: usuario.id, permisos: usuario.permisos ?? {} };
  }

  async updatePermissions(id: string, permisos: UserPermissions) {
    const usuario = await this.findOne(id);
    this.validatePermissions(permisos);
    usuario.permisos = permisos;
    await this.usuarioRepository.save(usuario);
    return { id: usuario.id, permisos: usuario.permisos };
  }

  private validatePermissions(permisos: UserPermissions): void {
    if (!permisos || typeof permisos !== 'object' || Array.isArray(permisos)) {
      throw new BadRequestException('El formato de permisos no es válido.');
    }

    const validSections = new Set<string>(permissionSections);
    for (const [section, actions] of Object.entries(permisos)) {
      if (
        !validSections.has(section) ||
        !actions ||
        typeof actions !== 'object' ||
        Array.isArray(actions)
      ) {
        throw new BadRequestException('El formato de permisos no es válido.');
      }

      const allowedActions =
        section === 'usuarios'
          ? ['consultar']
          : ['consultar', 'agregar', 'editar'];
      if (
        Object.entries(actions).some(
          ([action, value]) =>
            !allowedActions.includes(action) || typeof value !== 'boolean',
        )
      ) {
        throw new BadRequestException('El formato de permisos no es válido.');
      }

      if (
        section !== 'usuarios' &&
        (actions.agregar || actions.editar) &&
        actions.consultar !== true
      ) {
        throw new BadRequestException(
          'Para agregar o editar en un mantenimiento también se debe permitir consultar.',
        );
      }
    }
  }

  async remove(id: string) {
  const usuario = await this.findOne(id);

  if (usuario.rol === 'ADMINISTRADOR' && usuario.estado) {
    const administradoresActivos = await this.usuarioRepository.count({
      where: {
        rol: 'ADMINISTRADOR' as any,
        estado: true,
      },
    });

    if (administradoresActivos <= 1) {
      throw new BadRequestException(
        'No se puede desactivar al último administrador activo.',
      );
    }
  }

  usuario.estado = false;
  return await this.usuarioRepository.save(usuario);
}
  async findByEmail(email: string) {
    return await this.usuarioRepository.findOne({ where: { email, estado: true } });
  }
}
