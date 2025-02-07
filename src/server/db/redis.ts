// import type { RedisClient } from './redis-interface';
import productionRedis from './redis/redis-production';
import localRedis from './redis/redis-local';

const redis = process.env.NODE_ENV === 'production' 
  ? productionRedis
  : localRedis;

export default redis;