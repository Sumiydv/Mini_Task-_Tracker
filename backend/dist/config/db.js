import mongoose from 'mongoose';
import { env } from './env.js';
export async function connectMongo() {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri);
}
export async function disconnectMongo() {
    await mongoose.disconnect();
}
