import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Inicializamos el cliente de Google con tu variable de entorno
    this.googleClient = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
  }

  async loginConGoogle(token: string) {
    try {
      // 1. Google verifica matemáticamente que el token no sea falso
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });
      
      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw new UnauthorizedException('El token de Google no contiene un correo válido');
      }

      const email = payload.email;

      // 2. Revisamos si el correo ya está registrado por el Administrador
      const usuario = await this.usuariosService.findByEmail(email);
      
      if (!usuario) {
        throw new UnauthorizedException('Este correo no tiene acceso a Impacta');
      }

      // 3. Generamos el JWT oficial de Impacta para la sesión
      const jwtPayload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
      const accessToken = this.jwtService.sign(jwtPayload);

      return {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
        accessToken,
      };
} catch (error) {
  console.error('ERROR GOOGLE:', error);
  throw new UnauthorizedException('Error validando Google');
}
    
  }
}
