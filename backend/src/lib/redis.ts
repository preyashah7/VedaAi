import Redis from 'ioredis';

let redisClient: Redis | null = null;

export const getRedisClient = (redisUrl: string): Redis => {
  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  return redisClient;
};
