import { Queue } from 'bullmq';
import { getRedisClient } from '../lib/redis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const connection = getRedisClient(redisUrl);

export const generatePaperQueue = new Queue('generate-paper', {
  connection,
});
