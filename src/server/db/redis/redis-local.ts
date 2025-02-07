import { Redis } from 'ioredis';
import type { RedisClient } from './redis-interface';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: '123456'
}) as RedisClient;

export default redis;