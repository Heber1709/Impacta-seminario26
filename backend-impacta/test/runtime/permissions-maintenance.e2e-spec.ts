import request from 'supertest';
import {
  apiUrl,
  preserveQaData,
  reportPreservedQaData,
  tokenForRole,
  uniqueValue,
} from './support';

const adminToken = tokenForRole('ADMINISTRADOR');
const adminAuthorization = 'Bearer ' + adminToken;

describe('User maintenance permissions', () => {
  it('enforces view, add, edit, and admin-only user management permissions', async () => {
    const email = `${uniqueValue('qa-permissions')}@impacta.test`;
    let userId: string | undefined;
    let completed = false;

    try {
      const createdUser = await request(apiUrl)
        .post('/usuarios')
        .set('Authorization', adminAuthorization)
        .send({ email, nombre: 'Usuario de permisos QA', rol: 'VOLUNTARIO' })
        .expect(201);
      userId = createdUser.body.id;
      const volunteerToken = tokenForRole('VOLUNTARIO', userId);
      const userAuthorization = 'Bearer ' + volunteerToken;

      await request(apiUrl)
        .get('/usuarios/me')
        .set('Authorization', userAuthorization)
        .expect(200);

      await request(apiUrl)
        .get('/donantes')
        .set('Authorization', userAuthorization)
        .expect(403);

      await request(apiUrl)
        .patch(`/usuarios/${userId}/permisos`)
        .set('Authorization', adminAuthorization)
        .send({
          permisos: {
            donantes: { consultar: false, agregar: false, editar: true },
          },
        })
        .expect(400);

      const permisos = {
        donantes: { consultar: true, agregar: false, editar: false },
      };
      await request(apiUrl)
        .patch(`/usuarios/${userId}/permisos`)
        .set('Authorization', adminAuthorization)
        .send({ permisos })
        .expect(200);

      await request(apiUrl)
        .get('/donantes')
        .set('Authorization', userAuthorization)
        .expect(200);
      await request(apiUrl)
        .post('/donantes')
        .set('Authorization', userAuthorization)
        .send({})
        .expect(403);
      await request(apiUrl)
        .patch(`/donantes/${userId}`)
        .set('Authorization', userAuthorization)
        .send({})
        .expect(403);
      await request(apiUrl)
        .delete(`/donantes/${userId}`)
        .set('Authorization', userAuthorization)
        .expect(403);
      await request(apiUrl)
        .get('/usuarios')
        .set('Authorization', userAuthorization)
        .expect(403);

      await request(apiUrl)
        .patch(`/usuarios/${userId}/permisos`)
        .set('Authorization', userAuthorization)
        .send({ permisos: {} })
        .expect(403);

      await request(apiUrl)
        .patch(`/usuarios/${userId}/permisos`)
        .set('Authorization', adminAuthorization)
        .send({
          permisos: {
            ...permisos,
            usuarios: { consultar: true },
          },
        })
        .expect(200);
      await request(apiUrl)
        .get('/usuarios')
        .set('Authorization', userAuthorization)
        .expect(200);

      completed = true;
    } finally {
      if (userId) {
        if (preserveQaData && completed) {
          reportPreservedQaData('permission-user', { userId, email });
        } else {
          await request(apiUrl)
            .delete(`/usuarios/${userId}`)
            .set('Authorization', adminAuthorization)
            .expect(200);
        }
      }
    }
  });
});
