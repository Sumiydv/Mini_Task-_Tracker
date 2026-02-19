import dotenv from 'dotenv';
dotenv.config();
export const env = {
    port: Number(process.env.PORT || 4000),
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/task-tracker',
    jwtSecret: process.env.JWT_SECRET || 'dev_secret',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    nodeEnv: process.env.NODE_ENV || 'development'
};
