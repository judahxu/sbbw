// import type { RedisClient } from './redis-interface';
import productionRedis from './redis/redis-production';
// import localRedis from './redis/redis-local';

console.log('Current NODE_ENV:', process.env.NODE_ENV);

const redis = productionRedis
// process.env.NODE_ENV === 'production' 
//   ? productionRedis
//   : localRedis;

export default redis;