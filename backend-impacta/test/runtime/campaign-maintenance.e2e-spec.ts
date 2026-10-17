import request from 'supertest';
import {
  apiUrl,
  preserveQaData,
  reportPreservedQaData,
  tokenForRole,
  uniqueValue,
} from './support';

const adminAuthorization = `Bearer ${tokenForRole('ADMINISTRADOR')}`;

describe('Campaign maintenance workflow', () => {
  it('creates, reads, and updates a QA campaign', async () => {
    const campaignName = `QA - PRUEBA ${uniqueValue('campaign')}`;
    let campaignId: string | undefined;
    let completed = false;

    try {
      const created = await request(apiUrl)
        .post('/campanas')
        .set('Authorization', adminAuthorization)
        .send({
          nombre: campaignName,
          objetivo: 'Registro sintético para evidenciar las pruebas del mantenimiento de campañas.',
          fecha_inicio: new Date().toISOString().slice(0, 10),
          meta_economica: 0,
          meta_productos: 0,
        })
        .expect(201);

      campaignId = created.body.id;
      expect(created.body.nombre).toBe(campaignName);
      expect(created.body.estado).toBe(true);

      const found = await request(apiUrl)
        .get(`/campanas/${campaignId}`)
        .set('Authorization', adminAuthorization)
        .expect(200);
      expect(found.body.id).toBe(campaignId);
      expect(found.body.objetivo).toContain('sintético');

      const listed = await request(apiUrl)
        .get('/campanas')
        .set('Authorization', adminAuthorization)
        .expect(200);
      expect(
        listed.body.some((campaign: { id: string }) => campaign.id === campaignId),
      ).toBe(true);

      const updated = await request(apiUrl)
        .patch(`/campanas/${campaignId}`)
        .set('Authorization', adminAuthorization)
        .send({
          objetivo:
            'Registro sintético QA actualizado tras comprobar el mantenimiento de campañas.',
        })
        .expect(200);
      expect(updated.body.objetivo).toContain('actualizado');
      completed = true;
    } finally {
      if (preserveQaData && completed && campaignId) {
        reportPreservedQaData('campaign', { campaignId, campaignName });
      } else if (campaignId) {
        await request(apiUrl)
          .delete(`/campanas/${campaignId}`)
          .set('Authorization', adminAuthorization)
          .expect(200);
      }
    }
  });
});
