import { performance } from 'node:perf_hooks';
import request from 'supertest';
import {
  apiUrl,
  preserveQaData,
  reportPreservedQaData,
  tokenForRole,
  uniqueValue,
} from './support';

const adminToken = tokenForRole('ADMINISTRADOR');
const authorization = `Bearer ${adminToken}`;

describe('Donations, inventory, and response-time workflows', () => {
  it('persists a donation and its stock movements, and rejects an overdraw', async () => {
    const donorEmail = `${uniqueValue('qa-donor')}@impacta.test`;
    const donationCode = uniqueValue('QA-DONATION');
    let donorId: string | undefined;
    let donationId: string | undefined;
    const inventoryIds: string[] = [];
    let completed = false;

    try {
      const donor = await request(apiUrl)
        .post('/donantes')
        .set('Authorization', authorization)
        .send({
          nombre: 'Donante QA temporal',
          tipo: 'INDIVIDUAL',
          email: donorEmail,
        })
        .expect(201);
      donorId = donor.body.id;

      await request(apiUrl)
        .post('/donaciones')
        .set('Authorization', authorization)
        .send({ codigo_unico: donationCode })
        .expect(400);

      const donation = await request(apiUrl)
        .post('/donaciones')
        .set('Authorization', authorization)
        .send({
          codigo_unico: donationCode,
          tipo: 'FISICA',
          categoria: 'ALIMENTOS',
          donante_id: donorId,
        })
        .expect(201);
      donationId = donation.body.id;
      expect(donation.body.donante.id).toBe(donorId);

      const persistedDonation = await request(apiUrl)
        .get(`/donaciones/${donationId}`)
        .set('Authorization', authorization)
        .expect(200);
      expect(persistedDonation.body.codigo_unico).toBe(donationCode);

      const updatedDonation = await request(apiUrl)
        .patch(`/donaciones/${donationId}`)
        .set('Authorization', authorization)
        .send({
          tipo: 'MONETARIA',
          categoria: 'FINANCIERA',
          monto: 250.5,
          fotografia_url: 'https://example.test/donation.jpg',
        })
        .expect(200);
      expect(updatedDonation.body.tipo).toBe('MONETARIA');
      expect(updatedDonation.body.categoria).toBe('FINANCIERA');
      expect(Number(updatedDonation.body.monto)).toBe(250.5);
      expect(updatedDonation.body.fotografia_url).toBe(
        'https://example.test/donation.jpg',
      );

      const entry = await request(apiUrl)
        .post('/inventario')
        .set('Authorization', authorization)
        .send({
          tipo_movimiento: 'ENTRADA',
          cantidad: 10,
          observaciones: 'Movimiento temporal de prueba',
          donacion_id: donationId,
        })
        .expect(201);
      inventoryIds.push(entry.body.id);

      const exit = await request(apiUrl)
        .post('/inventario')
        .set('Authorization', authorization)
        .send({
          tipo_movimiento: 'SALIDA',
          cantidad: 6,
          observaciones: 'Salida temporal de prueba',
          donacion_id: donationId,
        })
        .expect(201);
      inventoryIds.push(exit.body.id);

      const movements = await request(apiUrl)
        .get('/inventario')
        .set('Authorization', authorization)
        .expect(200);
      expect(
        movements.body
          .filter((movement: { id: string }) =>
            inventoryIds.includes(movement.id),
          )
          .map((movement: { cantidad: number }) => movement.cantidad)
          .sort((left: number, right: number) => left - right),
      ).toEqual([6, 10]);

      await request(apiUrl)
        .post('/inventario')
        .set('Authorization', authorization)
        .send({
          tipo_movimiento: 'SALIDA',
          cantidad: 5,
          donacion_id: donationId,
        })
        .expect(400);

      completed = true;
    } finally {
      if (preserveQaData && completed && donorId && donationId) {
        reportPreservedQaData('donation-inventory', {
          donorId,
          donationId,
          inventoryIds,
          donorEmail,
          donationCode,
        });
      } else {
        for (const id of inventoryIds.reverse()) {
          await request(apiUrl)
            .delete(`/inventario/${id}`)
            .set('Authorization', authorization)
            .expect(200);
        }
        if (donationId) {
          await request(apiUrl)
            .delete(`/donaciones/${donationId}`)
            .set('Authorization', authorization)
            .expect(200);
        }
        if (donorId) {
          await request(apiUrl)
            .delete(`/donantes/${donorId}`)
            .set('Authorization', authorization)
            .expect(200);
        }
      }
    }
  });

  it('keeps local donation-list reads below the 2-second response threshold', async () => {
    const samples: number[] = [];

    for (let index = 0; index < 20; index += 1) {
      const startedAt = performance.now();
      await request(apiUrl)
        .get('/donaciones')
        .set('Authorization', authorization)
        .expect(200);
      samples.push(performance.now() - startedAt);
    }

    samples.sort((left, right) => left - right);
    const p95 = samples[Math.ceil(samples.length * 0.95) - 1];
    console.info(
      `GET /donaciones p95=${p95.toFixed(1)} ms (${samples.length} sequential samples)`,
    );
    expect(p95).toBeLessThan(2000);
  });
});
