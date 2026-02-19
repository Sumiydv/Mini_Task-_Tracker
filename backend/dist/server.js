import { app } from './app.js';
import { connectMongo } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { env } from './config/env.js';
async function start() {
    await connectMongo();
    await connectRedis();
    app.listen(env.port, () => {
        console.log(`Server running on port ${env.port}`);
    });
}
start().catch((err) => {
    console.error(err);
    process.exit(1);
});
