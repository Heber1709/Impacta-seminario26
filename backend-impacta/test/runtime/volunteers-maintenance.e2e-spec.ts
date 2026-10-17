import request from 'supertest';
import {
  apiUrl,
  existingLocation,
  tokenForRole,
  uniqueDpi,
  uniqueValue,
} from './support';

const adminToken = tokenForRole('ADMINISTRADOR');

describe('Volunteer maintenance', () => {
  it('creates, updates, lists, and deactivates a volunteer', async () => {
    const dpi = uniqueDpi();
    const location = await existingLocation();
    let volunteerId: string | undefined;
    let deactivated = false;

    try {
      const created = await request(apiUrl)
        .post('/voluntarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dpi,
          nombre_completo: uniqueValue('Voluntario QA'),
          direccion: uniqueValue('Dirección QA'),
          ...location,
        })
        .expect(201);

      volunteerId = created.body.id;
      expect(created.body.dpi).toBe(dpi);
      expect(created.body.estado).toBe(true);

      const updated = await request(apiUrl)
        .patch(`/voluntarios/${volunteerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre_completo: 'Voluntario QA actualizado' })
        .expect(200);
      expect(updated.body.nombre_completo).toBe('Voluntario QA actualizado');

      const listed = await request(apiUrl)
        .get('/voluntarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(listed.body.some((item: { id: string }) => item.id === volunteerId))
        .toBe(true);

      await request(apiUrl)
        .delete(`/voluntarios/${volunteerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      deactivated = true;

      const afterDeactivation = await request(apiUrl)
        .get('/voluntarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(
        afterDeactivation.body.some(
          (item: { id: string }) => item.id === volunteerId,
        ),
      ).toBe(false);
    } finally {
      if (volunteerId && !deactivated) {
        await request(apiUrl)
          .delete(`/voluntarios/${volunteerId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      }
    }
  });
});
