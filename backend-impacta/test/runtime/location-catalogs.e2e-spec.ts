import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { apiUrl, tokenForRole, uniqueDpi } from './support';

const adminToken = tokenForRole('ADMINISTRADOR');

describe('Location catalogs', () => {
  it('maintains linked department and municipality catalogs', async () => {
    const suffix = randomUUID().replace(/-/g, '').slice(0, 8);
    const departmentCode = `D${suffix}`;
    const secondDepartmentCode = `X${suffix}`;
    const municipalityCode = `M${suffix}`;
    let municipalityCreated = false;
    let departmentCreated = false;
    let secondDepartmentCreated = false;

    try {
      await request(apiUrl)
        .post('/catalogos/departamentos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          codigo_departamento: departmentCode,
          descripcion: `Departamento QA ${suffix}`,
        })
        .expect(201);
      departmentCreated = true;

      await request(apiUrl)
        .post('/catalogos/departamentos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          codigo_departamento: secondDepartmentCode,
          descripcion: `Departamento QA alterno ${suffix}`,
        })
        .expect(201);
      secondDepartmentCreated = true;

      const createdMunicipality = await request(apiUrl)
        .post('/catalogos/municipios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          codigo_municipio: municipalityCode,
          descripcion: `Municipio QA ${suffix}`,
          codigo_departamento: departmentCode,
        })
        .expect(201);
      municipalityCreated = true;
      expect(createdMunicipality.body.codigo_departamento).toBe(departmentCode);

      const filtered = await request(apiUrl)
        .get(`/catalogos/municipios?codigo_departamento=${departmentCode}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(filtered.body).toEqual([
        expect.objectContaining({
          codigo_municipio: municipalityCode,
          codigo_departamento: departmentCode,
        }),
      ]);

      await request(apiUrl)
        .post('/voluntarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dpi: uniqueDpi(),
          nombre_completo: 'Voluntario de prueba',
          direccion: 'Dirección de prueba',
          codigo_departamento: secondDepartmentCode,
          codigo_municipio: municipalityCode,
        })
        .expect(400);

      await request(apiUrl)
        .patch(`/catalogos/departamentos/${departmentCode}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ descripcion: `Departamento QA actualizado ${suffix}` })
        .expect(200);

      const blockedDepartmentDelete = await request(apiUrl)
        .delete(`/catalogos/departamentos/${departmentCode}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
      expect(blockedDepartmentDelete.body.message).toContain(
        'tiene municipios o personas asociadas',
      );
    } finally {
      if (municipalityCreated) {
        await request(apiUrl)
          .delete(`/catalogos/municipios/${municipalityCode}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      }
      if (departmentCreated) {
        await request(apiUrl)
          .delete(`/catalogos/departamentos/${departmentCode}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      }
      if (secondDepartmentCreated) {
        await request(apiUrl)
          .delete(`/catalogos/departamentos/${secondDepartmentCode}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      }
    }
  });
});
