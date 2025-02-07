import { Redis } from '@upstash/redis';
import type { RedisClient } from './redis-interface';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
}) as RedisClient;

export default redis;