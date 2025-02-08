// src/server/init.ts
import { setupPlusStatusWorker } from '../workers/plus-status';
import redis from '../db/redis';

const WORKER_LOCK_KEY = 'worker:cron:lock';
const LOCK_TTL = 60 * 60; // 1小时，根据需要调整

export async function initializeServer() {
  try {
    // 使用setNX来设置锁
    const locked = await redis.setnx(WORKER_LOCK_KEY, process.pid.toString());
    
    if (locked === 1) {
      // 如果成功获取锁，设置过期时间
      await redis.expire(WORKER_LOCK_KEY, LOCK_TTL);
    } else {
      // 获取当前锁的持有者
      const currentHolder = await redis.get(WORKER_LOCK_KEY);
      console.log(`Worker already running in process ${currentHolder ?? "unknown"}`);
      return;
    }

    console.log(`Worker lock acquired by process ${process.pid}`);

    // 启动定时任务
    setupPlusStatusWorker();

    // 设置自动续期
    const renewLock = () => {
      void (async () => {
        try {
          // 检查是否仍然持有锁
          const currentHolder = await redis.get(WORKER_LOCK_KEY);
          if (currentHolder === process.pid.toString()) {
            const renewed = await redis.expire(WORKER_LOCK_KEY, LOCK_TTL);
            if (renewed === 1) {
              console.log('Worker lock renewed');
            } else {
              console.warn('Failed to renew worker lock');
            }
          }
        } catch (error) {
          console.error('Error renewing worker lock:', error);
        }
      })();
    };

    // 每30分钟续期一次
    setInterval(renewLock, 30 * 60 * 1000);

    // 优雅退出处理
    const cleanup = () => {
      void (async () => {
        try {
          // 只有当前进程持有锁时才释放
          const currentHolder = await redis.get(WORKER_LOCK_KEY);
          if (currentHolder === process.pid.toString()) {
            await redis.del(WORKER_LOCK_KEY);
            console.log('Worker lock released');
          }
        } catch (error) {
          console.error('Error cleaning up worker lock:', error);
        }
        process.exit(0);
      })();
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

    console.log('Server initialization completed');
  } catch (error) {
    console.error('Server initialization failed:', error);
    throw error;
  }
}