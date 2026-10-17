import request from 'supertest';
import {
  apiUrl,
  preserveQaData,
  reportPreservedQaData,
  tokenForRole,
  uniqueValue,
} from './support';

const adminAuthorization = `Bearer ${tokenForRole('ADMINISTRADOR')}`;

describe('Donantes catalog workflow', () => {
  it('validates, creates, lists, reads, updates, and deactivates a donor', async () => {
    const donorName = uniqueValue('Donante QA');
    const donorEmail = `${uniqueValue('donor')}@impacta.test`;
    let donorId: string | undefined;
    let completed = false;
    let deactivated = false;

    try {
      await request(apiUrl).get('/donantes').expect(401);

      await request(apiUrl)
        .post('/donantes')
        .set('Authorization', adminAuthorization)
        .send({ nombre: '', tipo: 'INVALIDO' })
        .expect(400);

      const created = await request(apiUrl)
        .post('/donantes')
        .set('Authorization', adminAuthorization)
        .send({
          nombre: donorName,
          tipo: 'INDIVIDUAL',
          email: donorEmail,
          telefono: '55512345',
        })
        .expect(201);

      donorId = created.body.id;
      expect(created.body.nombre).toBe(donorName);
      expect(created.body.estado).toBe(true);

      const catalog = await request(apiUrl)
        .get('/donantes')
        .set('Authorization', adminAuthorization)
        .expect(200);
      expect(
        catalog.body.some((donor: { id: string }) => donor.id === donorId),
      ).toBe(true);

      const found = await request(apiUrl)
        .get(`/donantes/${donorId}`)
        .set('Authorization', adminAuthorization)
        .expect(200);
      expect(found.body.email).toBe(donorEmail);
      expect(found.body.tipo).toBe('INDIVIDUAL');

      const updatedName = `${donorName} actualizado`;
      const updated = await request(apiUrl)
        .patch(`/donantes/${donorId}`)
        .set('Authorization', adminAuthorization)
        .send({ nombre: updatedName })
        .expect(200);
      expect(updated.body.nombre).toBe(updatedName);

      await request(apiUrl)
        .delete(`/donantes/${donorId}`)
        .set('Authorization', adminAuthorization)
        .expect(200);
      deactivated = true;

      const catalogAfterDeactivation = await request(apiUrl)
        .get('/donantes')
        .set('Authorization', adminAuthorization)
        .expect(200);
      expect(
        catalogAfterDeactivation.body.some(
          (donor: { id: string }) => donor.id === donorId,
        ),
      ).toBe(false);

      await request(apiUrl)
        .get(`/donantes/${donorId}`)
        .set('Authorization', adminAuthorization)
        .expect(404);

      completed = true;
    } finally {
      if (preserveQaData && completed && donorId) {
        reportPreservedQaData('donor-catalog', {
          donorId,
          donorName,
          donorEmail,
        });
      } else if (donorId && !deactivated) {
        await request(apiUrl)
          .delete(`/donantes/${donorId}`)
          .set('Authorization', adminAuthorization)
          .expect(200);
      }
    }
  });
});
