import { performance } from 'node:perf_hooks';
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
const authorization = `Bearer ${adminToken}`;

describe('Donations, inventory, and response-time workflows', () => {
  it('maintains movement types with a description and stock sign', async () => {
    const codigo = `QA${Date.now().toString(36).toUpperCase()}`;

    const initialTypes = await request(apiUrl)
      .get('/tipos-movimiento')
      .set('Authorization', authorization)
      .expect(200);
    expect(initialTypes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ codigo: 'ENTRADA', signo: '+' }),
        expect.objectContaining({ codigo: 'SALIDA', signo: '-' }),
      ]),
    );

    await request(apiUrl)
      .post('/tipos-movimiento')
      .set('Authorization', authorization)
      .send({ codigo, descripcion: 'Ajuste inválido', signo: '*' })
      .expect(400);

    const created = await request(apiUrl)
      .post('/tipos-movimiento')
      .set('Authorization', authorization)
      .send({ codigo, descripcion: 'Ajuste QA', signo: '+' })
      .expect(201);
    expect(created.body.descripcion).toBe('Ajuste QA');

    await request(apiUrl)
      .patch(`/tipos-movimiento/${codigo}`)
      .set('Authorization', authorization)
      .send({ descripcion: 'Ajuste QA actualizado', signo: '-' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.descripcion).toBe('Ajuste QA actualizado');
        expect(body.signo).toBe('-');
      });

    await request(apiUrl)
      .delete(`/tipos-movimiento/${codigo}`)
      .set('Authorization', authorization)
      .expect(200);

    const remainingTypes = await request(apiUrl)
      .get('/tipos-movimiento')
      .set('Authorization', authorization)
      .expect(200);
    expect(
      remainingTypes.body.some(
        (tipo: { codigo: string }) => tipo.codigo === codigo,
      ),
    ).toBe(false);
  });

  it('persists a donation and its stock movements, and rejects an overdraw', async () => {
    const donorEmail = `${uniqueValue('qa-donor')}@impacta.test`;
    const donationCode = uniqueValue('QA-DONATION');
    let donorId: string | undefined;
    let donationId: string | undefined;
    let beneficiaryId: string | undefined;
    let deliveryId: string | undefined;
    let numeroEntrega: number | undefined;
    let tipoTemporalCodigo: string | undefined;
    const inventoryIds: string[] = [];
    let completed = false;

    try {
      const deliveries = await request(apiUrl)
        .get('/entregas')
        .set('Authorization', authorization)
        .expect(200);
      const existingDelivery = deliveries.body[0];

      if (existingDelivery) {
        deliveryId = existingDelivery.id;
        numeroEntrega = existingDelivery.numero_entrega;
      } else {
        const location = await existingLocation();
        const beneficiary = await request(apiUrl)
          .post('/beneficiarios')
          .set('Authorization', authorization)
          .send({
            dpi: uniqueDpi(),
            nombre_completo: 'Beneficiario QA inventario',
            direccion: 'Dirección de pruebas',
            ...location,
            integrantes_hogar: 1,
          })
          .expect(201);
        beneficiaryId = beneficiary.body.id;

        const users = await request(apiUrl)
          .get('/usuarios')
          .set('Authorization', authorization)
          .expect(200);
        const user = users.body.find(
          (item: { estado: boolean }) => item.estado,
        );
        expect(user).toBeDefined();

        const delivery = await request(apiUrl)
          .post('/entregas')
          .set('Authorization', authorization)
          .send({
            beneficiario_id: beneficiaryId,
            usuario_id: user.id,
          })
          .expect(201);
        deliveryId = delivery.body.id;
        numeroEntrega = delivery.body.numero_entrega;
      }

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

      const tipoTemporal = await request(apiUrl)
        .post('/tipos-movimiento')
        .set('Authorization', authorization)
        .send({
          codigo: `QA${Date.now().toString(36).toUpperCase()}`,
          descripcion: 'Ajuste QA de salida',
          signo: '-',
        })
        .expect(201);
      tipoTemporalCodigo = tipoTemporal.body.codigo;

      const entry = await request(apiUrl)
        .post('/inventario')
        .set('Authorization', authorization)
        .send({
          tipo_movimiento: 'ENTRADA',
          cantidad: 10,
          observaciones: 'Movimiento temporal de prueba',
          donacion_id: donationId,
          numero_entrega: numeroEntrega,
        })
        .expect(201);
      inventoryIds.push(entry.body.id);
      expect(entry.body.entrega.numero_entrega).toBe(numeroEntrega);

      const exit = await request(apiUrl)
        .post('/inventario')
        .set('Authorization', authorization)
        .send({
          tipo_movimiento: 'SALIDA',
          cantidad: 6,
          observaciones: 'Salida temporal de prueba',
          donacion_id: donationId,
          numero_entrega: numeroEntrega,
        })
        .expect(201);
      inventoryIds.push(exit.body.id);

      await request(apiUrl)
        .post('/inventario')
        .set('Authorization', authorization)
        .send({
          tipo_movimiento: tipoTemporalCodigo,
          cantidad: 5,
          donacion_id: donationId,
          numero_entrega: numeroEntrega,
        })
        .expect(400);

      await request(apiUrl)
        .post('/inventario')
        .set('Authorization', authorization)
        .send({
          tipo_movimiento: 'ENTRADA',
          cantidad: 1,
          donacion_id: donationId,
        })
        .expect(400);

      const movements = await request(apiUrl)
        .get('/inventario')
        .set('Authorization', authorization)
        .expect(200);
      const persistedEntry = movements.body.find(
        (movement: { id: string }) => movement.id === entry.body.id,
      );
      expect(persistedEntry.entrega.numero_entrega).toBe(numeroEntrega);
      const movementDetail = await request(apiUrl)
        .get(`/inventario/${entry.body.id}`)
        .set('Authorization', authorization)
        .expect(200);
      expect(movementDetail.body.entrega.numero_entrega).toBe(numeroEntrega);
      expect(movementDetail.body.donacion.codigo_unico).toBe(donationCode);
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
          numero_entrega: numeroEntrega,
        })
        .expect(400);

      completed = true;
    } finally {
      if (
        preserveQaData &&
        completed &&
        donorId &&
        donationId &&
        deliveryId
      ) {
        reportPreservedQaData('donation-inventory', {
          donorId,
          donationId,
          inventoryIds,
          donorEmail,
          donationCode,
          deliveryId,
          ...(beneficiaryId && { beneficiaryId }),
        });
      } else {
        for (const id of inventoryIds.reverse()) {
          await request(apiUrl)
            .delete(`/inventario/${id}`)
            .set('Authorization', authorization)
            .expect(200);
        }
        if (tipoTemporalCodigo) {
          await request(apiUrl)
            .delete(`/tipos-movimiento/${tipoTemporalCodigo}`)
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
        if (beneficiaryId && deliveryId) {
          await request(apiUrl)
            .delete(`/entregas/${deliveryId}`)
            .set('Authorization', authorization)
            .expect(200);
        }
        if (beneficiaryId) {
          await request(apiUrl)
            .delete(`/beneficiarios/${beneficiaryId}`)
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
