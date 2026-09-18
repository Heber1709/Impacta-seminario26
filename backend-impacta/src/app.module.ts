import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    // Esto carga las variables de tu archivo .env
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Esto configura la conexión a PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      // synchronize en true crea/actualiza las tablas automáticamente 
      // (solo úsalo en desarrollo, es buenísimo para avanzar rápido)
      synchronize: true, 
    }),
    
    UsuariosModule,
    
    BeneficiariosModule,
    
    DonantesModule,
    
    DonacionesModule,
    
    InventarioModule,
    
    CampanasModule,
    
    EntregasModule,
    
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}