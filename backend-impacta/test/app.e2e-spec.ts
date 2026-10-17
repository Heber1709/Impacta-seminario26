import request from 'supertest';

const apiUrl = process.env.TEST_API_URL ?? 'http://localhost:3000';

describe('Impacta API runtime smoke test', () => {
  it('responds successfully at the root endpoint', async () => {
    await request(apiUrl)
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
