import { Redis } from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  // password: 'your-password', // 如果设置了密码
});

// 测试连接
redis.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

redis.on('connect', () => {
  console.log('Redis连接成功!');
});

export default redis;