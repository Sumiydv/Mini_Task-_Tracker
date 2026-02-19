import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

jest.mock('redis');

let app: any;
let connectMongo: any;
let disconnectMongo: any;
let connectRedis: any;
let disconnectRedis: any;
let mongo: MongoMemoryServer;

async function getToken() {
  await request(app).post('/api/auth/signup').send({
    name: 'Task User',
    email: 'task@example.com',
    password: 'password123'
  });

  const login = await request(app).post('/api/auth/login').send({
    email: 'task@example.com',
    password: 'password123'
  });

  return login.body.token as string;
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  process.env.JWT_SECRET = 'testsecret';

  const appModule = await import('../src/app.js');
  const dbModule = await import('../src/config/db.js');
  const redisModule = await import('../src/config/redis.js');

  app = appModule.app;
  connectMongo = dbModule.connectMongo;
  disconnectMongo = dbModule.disconnectMongo;
  connectRedis = redisModule.connectRedis;
  disconnectRedis = redisModule.disconnectRedis;

  await connectMongo();
  await connectRedis();
});

afterAll(async () => {
  await disconnectMongo();
  await disconnectRedis();
  await mongo.stop();
});

describe('Tasks', () => {
  it('should create, list, update, and delete a task', async () => {
    const token = await getToken();

    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', description: 'Do something' });

    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(1);

    const taskId = listRes.body[0]._id;

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe('completed');

    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
  });

  it('should invalidate cache after creating a task', async () => {
    const token = await getToken();

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'First Task' });

    const listRes1 = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes1.body.length).toBe(1);

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Second Task' });

    const listRes2 = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes2.body.length).toBe(2);
  });
});
