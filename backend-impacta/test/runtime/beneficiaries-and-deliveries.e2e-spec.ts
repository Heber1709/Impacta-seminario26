import request from 'supertest';
import {
  apiUrl,
  existingLocation,
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
    const location = await existingLocation();
    let beneficiaryId: string | undefined;
    let deliveryId: string | undefined;
    const volunteerIds: string[] = [];
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
          ...location,
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
          ...location,
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

      for (const index of [1, 2]) {
        const volunteer = await request(apiUrl)
          .post('/voluntarios')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            dpi: uniqueDpi(),
            nombre_completo: `Voluntario QA ${index}`,
            direccion: 'Dirección de pruebas',
            ...location,
          })
          .expect(201);
        volunteerIds.push(volunteer.body.id);
      }

      const delivery = await request(apiUrl)
        .post('/entregas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          evidencia_url: `https://example.test/${uniqueValue('evidence')}`,
          beneficiario_id: beneficiaryId,
          usuario_id: user.id,
          voluntarios_ids: volunteerIds,
        })
        .expect(201);

      deliveryId = delivery.body.id;
      expect(delivery.body.numero_entrega).toEqual(expect.any(Number));
      expect(delivery.body.numero_entrega).toBeGreaterThan(0);
      expect(delivery.body.beneficiario.id).toBe(beneficiaryId);
      expect(delivery.body.usuario.id).toBe(user.id);
      expect(
        delivery.body.voluntarios.map(
          (volunteer: { id: string }) => volunteer.id,
        ),
      ).toEqual(expect.arrayContaining(volunteerIds));

      const listedDeliveries = await request(apiUrl)
        .get('/entregas')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const listedDelivery = listedDeliveries.body.find(
        (item: { id: string }) => item.id === deliveryId,
      );
      expect(listedDelivery).toBeDefined();
      expect(listedDelivery.numero_entrega).toBe(delivery.body.numero_entrega);
      expect(listedDelivery.voluntarios).toEqual(
        expect.arrayContaining(volunteerIds),
      );

      const persistedDelivery = await request(apiUrl)
        .get(`/entregas/${deliveryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(persistedDelivery.body.numero_entrega).toBe(
        delivery.body.numero_entrega,
      );
      expect(
        persistedDelivery.body.voluntarios.map(
          (volunteer: { id: string }) => volunteer.id,
        ),
      ).toEqual(expect.arrayContaining(volunteerIds));

      const updatedDelivery = await request(apiUrl)
        .patch(`/entregas/${deliveryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ voluntarios_ids: [volunteerIds[1]] })
        .expect(200);
      expect(
        updatedDelivery.body.voluntarios.map(
          (volunteer: { id: string }) => volunteer.id,
        ),
      ).toEqual([volunteerIds[1]]);

      const restoredDelivery = await request(apiUrl)
        .patch(`/entregas/${deliveryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ voluntarios_ids: volunteerIds })
        .expect(200);
      expect(
        restoredDelivery.body.voluntarios.map(
          (volunteer: { id: string }) => volunteer.id,
        ),
      ).toEqual(expect.arrayContaining(volunteerIds));

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
      if (
        preserveQaData &&
        completed &&
        beneficiaryId &&
        deliveryId &&
        volunteerIds.length === 2
      ) {
        reportPreservedQaData('beneficiary-delivery', {
          beneficiaryId,
          deliveryId,
          dpi,
          volunteerIds,
        });
      } else {
        if (deliveryId) {
          await request(apiUrl)
            .delete(`/entregas/${deliveryId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
        }
        for (const volunteerId of volunteerIds) {
          await request(apiUrl)
            .delete(`/voluntarios/${volunteerId}`)
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
