import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

jest.mock('redis');

let app: any;
let connectMongo: any;
let disconnectMongo: any;
let connectRedis: any;
let disconnectRedis: any;
let mongo: MongoMemoryServer;

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

describe('Auth', () => {
  it('should sign up a user', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
  });

  it('should log in a user', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'login@example.com',
      password: 'password123'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
