# Impacta - Backend API 

Plataforma de asistencia social diseñada para centralizar y gestionar donantes, donaciones, beneficiarios, inventarios de ayuda y campañas de recolección. Este proyecto expone una API REST segura y escalable construida con arquitectura de 3 capas.

## Tecnologías y Dependencias Principales

- **Framework:** [NestJS](https://nestjs.com/) (Node.js) con TypeScript.
- **Base de Datos:** PostgreSQL.
- **ORM:** TypeORM.
- **Autenticación:** Autenticación de doble capa con Google OAuth 2.0 (`google-auth-library`) y JSON Web Tokens (`@nestjs/jwt`).
- **Documentación:** Swagger / OpenAPI (`@nestjs/swagger`).
- **Validación de Datos:** `class-validator` y `class-transformer`.

## Requisitos Previos

Antes de ejecutar este proyecto, asegúrate de tener instalado en tu máquina:
- [Node.js](https://nodejs.org/) (Versión 20 o superior).
- [PostgreSQL](https://www.postgresql.org/) y [pgAdmin](https://www.pgadmin.org/) (o cualquier cliente de base de datos).
- Git.
## Instalación de Dependencias
npm install

## Ejecución del Servidor
Desarrollo (con recarga automática al guardar cambios)
npm run start:dev

## Documentación de la API (Swagger)
Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva de los endpoints, esquemas de datos y probar las peticiones HTTP ingresando a:

http://localhost:3000/api

Nota para Frontend: Puedes descargar la colección completa en formato JSON para importar a Postman desde http://localhost:3000/api-json.

## Estructura de Seguridad
Todos los módulos de gestión están protegidos mediante el JwtAuthGuard.
Para interactuar con la API, el cliente frontend debe:

Enviar el token de Google al endpoint POST /auth/google.

Recibir el accessToken (JWT) generado por Impacta.

Enviar este JWT en los headers de las peticiones subsecuentes bajo el formato Authorization: Bearer <token>.

## Configuración del Entorno

1. Clona este repositorio.
2. Crea una base de datos en PostgreSQL llamada `db_impacta`.
3. Crea un archivo `.env` en la raíz del proyecto basándote en la siguiente estructura:

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432       # Cambiar a 5433 si tu entorno lo requiere
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=db_impacta

# Configuración de Seguridad
JWT_SECRET=tu_frase_secreta_super_segura
GOOGLE_CLIENT_ID=tu_cliente_id_de_google

