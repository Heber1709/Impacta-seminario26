import request from 'supertest';
import {
  apiUrl,
  preserveQaData,
  reportPreservedQaData,
  tokenForRole,
  uniqueValue,
} from './support';

const adminToken = tokenForRole('ADMINISTRADOR');
const volunteerToken = tokenForRole('VOLUNTARIO');

describe('Authentication and user administration', () => {
  it('rejects missing, invalid, and underprivileged credentials', async () => {
    await request(apiUrl).get('/donantes').expect(401);
    await request(apiUrl)
      .get('/donantes')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    await request(apiUrl)
      .get('/usuarios')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .expect(403);
  });

  it('creates, reads, updates, and deactivates a user with admin authorization', async () => {
    const email = `${uniqueValue('qa-user')}@impacta.test`;
    let userId: string | undefined;
    let completed = false;

    try {
      const created = await request(apiUrl)
        .post('/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, nombre: 'Usuario QA temporal', rol: 'VOLUNTARIO' })
        .expect(201);

      userId = created.body.id;
      expect(created.body.email).toBe(email);

      await request(apiUrl)
        .post('/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, nombre: 'Usuario duplicado', rol: 'VOLUNTARIO' })
        .expect(400);

      const updated = await request(apiUrl)
        .patch(`/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Usuario QA actualizado' })
        .expect(200);
      expect(updated.body.nombre).toBe('Usuario QA actualizado');

      const found = await request(apiUrl)
        .get(`/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(found.body.id).toBe(userId);
      completed = true;
    } finally {
      if (userId) {
        await request(apiUrl)
          .delete(`/usuarios/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        if (preserveQaData && completed) {
          reportPreservedQaData('user', {
            userId,
            email,
            estado: 'inactivo',
          });
        }
      }
    }
  });
});
