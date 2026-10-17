import { createHmac, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import request from 'supertest';

export const apiUrl =
  process.env.TEST_API_URL ?? 'http://localhost:3000';

export const preserveQaData = process.env.PRESERVE_QA_DATA === 'true';

export function reportPreservedQaData(
  entity: string,
  records: Record<string, string | string[]>,
): void {
  console.info(
    `QA_DATA_PRESERVED ${JSON.stringify({ entity, ...records })}`,
  );
}

function readJwtSecret(): string {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  const envFile = readFileSync(resolve(__dirname, '../../.env'), 'utf8');
  const value = envFile
    .split(/\r?\n/)
    .find((line) => line.startsWith('JWT_SECRET='))
    ?.slice('JWT_SECRET='.length)
    .replace(/^["']|["']$/g, '');

  if (!value) {
    throw new Error('JWT_SECRET must be set in the environment or backend .env');
  }

  return value;
}

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

export function tokenForRole(rol: string, sub = randomUUID()): string {
  const unsigned = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    sub,
    email: `qa-${sub}@impacta.test`,
    rol,
  })}`;
  const signature = createHmac('sha256', readJwtSecret())
    .update(unsigned)
    .digest('base64url');

  return `${unsigned}.${signature}`;
}

export function uniqueValue(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

export function uniqueDpi(): string {
  return randomUUID().replace(/\D/g, '').padEnd(13, '0').slice(0, 13);
}

export async function existingLocation(): Promise<{
  codigo_departamento: string;
  codigo_municipio: string;
}> {
  const authorization = `Bearer ${tokenForRole('ADMINISTRADOR')}`;
  const [departmentsResponse, municipalitiesResponse] = await Promise.all([
    request(apiUrl)
      .get('/catalogos/departamentos')
      .set('Authorization', authorization),
    request(apiUrl)
      .get('/catalogos/municipios')
      .set('Authorization', authorization),
  ]);

  if (!departmentsResponse.ok || !municipalitiesResponse.ok) {
    throw new Error('No fue posible cargar los catálogos para las pruebas.');
  }

  const department = departmentsResponse.body[0];
  const municipality = municipalitiesResponse.body.find(
    (item: { codigo_departamento: string }) =>
      item.codigo_departamento === department?.codigo_departamento,
  );

  if (!department || !municipality) {
    throw new Error('Las pruebas requieren un departamento con municipios.');
  }

  return {
    codigo_departamento: department.codigo_departamento,
    codigo_municipio: municipality.codigo_municipio,
  };
}
