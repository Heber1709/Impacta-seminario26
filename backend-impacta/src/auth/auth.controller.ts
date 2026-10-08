import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Auth')


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  loginConGoogle(@Body('token') token: string) {
    return this.authService.loginConGoogle(token);
  }
}
