import request from 'supertest';
import {
  apiUrl,
  preserveQaData,
  reportPreservedQaData,
  tokenForRole,
  uniqueDpi,
  uniqueValue,
} from './support';

const adminToken = tokenForRole('ADMINISTRADOR');

describe('Beneficiary and delivery workflows', () => {
  it('validates beneficiary data, persists it, and registers a linked delivery', async () => {
    const dpi = uniqueDpi();
    let beneficiaryId: string | undefined;
    let deliveryId: string | undefined;
    let completed = false;

    try {
      await request(apiUrl)
        .post('/beneficiarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ dpi, nombre_completo: 'Beneficiario QA' })
        .expect(400);

      const created = await request(apiUrl)
        .post('/beneficiarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dpi,
          nombre_completo: 'Beneficiario QA temporal',
          direccion: 'Dirección de pruebas',
          municipio: 'Municipio QA',
          departamento: 'Departamento QA',
          integrantes_hogar: 3,
        })
        .expect(201);

      beneficiaryId = created.body.id;
      expect(created.body.dpi).toBe(dpi);

      await request(apiUrl)
        .post('/beneficiarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dpi,
          nombre_completo: 'Beneficiario duplicado',
          direccion: 'Dirección de pruebas',
          municipio: 'Municipio QA',
          departamento: 'Departamento QA',
          integrantes_hogar: 1,
        })
        .expect(400);

      const users = await request(apiUrl)
        .get('/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const user = users.body.find(
        (item: { estado: boolean; id: string }) => item.estado,
      );
      expect(user).toBeDefined();

      const delivery = await request(apiUrl)
        .post('/entregas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          evidencia_url: `https://example.test/${uniqueValue('evidence')}`,
          beneficiario_id: beneficiaryId,
          usuario_id: user.id,
        })
        .expect(201);

      deliveryId = delivery.body.id;
      expect(delivery.body.beneficiario.id).toBe(beneficiaryId);
      expect(delivery.body.usuario.id).toBe(user.id);

      const persisted = await request(apiUrl)
        .get(`/beneficiarios/${beneficiaryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(persisted.body.nombre_completo).toBe(
        'Beneficiario QA temporal',
      );

      const updated = await request(apiUrl)
        .patch(`/beneficiarios/${beneficiaryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ integrantes_hogar: 4 })
        .expect(200);
      expect(updated.body.integrantes_hogar).toBe(4);
      completed = true;
    } finally {
      if (preserveQaData && completed && beneficiaryId && deliveryId) {
        reportPreservedQaData('beneficiary-delivery', {
          beneficiaryId,
          deliveryId,
          dpi,
        });
      } else {
        if (deliveryId) {
          await request(apiUrl)
            .delete(`/entregas/${deliveryId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
        }
        if (beneficiaryId) {
          await request(apiUrl)
            .delete(`/beneficiarios/${beneficiaryId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
        }
      }
    }
  });
});
