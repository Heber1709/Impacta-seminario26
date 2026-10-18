import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { BeneficiariosModule } from './beneficiarios/beneficiarios.module';
import { DonantesModule } from './donantes/donantes.module';
import { DonacionesModule } from './donaciones/donaciones.module';
import { InventarioModule } from './inventario/inventario.module';
import { CampanasModule } from './campanas/campanas.module';
import { EntregasModule } from './entregas/entregas.module';
import { AuthModule } from './auth/auth.module';
import { VoluntariosModule } from './voluntarios/voluntarios.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { TiposMovimientoModule } from './tipos-movimiento/tipos-movimiento.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    UsuariosModule,

    BeneficiariosModule,

    DonantesModule,

    DonacionesModule,

    InventarioModule,

    CampanasModule,

    EntregasModule,

    AuthModule,

    VoluntariosModule,

    CatalogosModule,

    TiposMovimientoModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}