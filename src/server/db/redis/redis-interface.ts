export interface RedisClient {
  set(key: string, value: string, expiryMode?: string, time?: number): Promise<'OK'>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
    // 分布式锁相关操作
  setnx(key: string, value: string): Promise<number>;  // 返回1表示成功，0表示失败
  expire(key: string, seconds: number): Promise<number>;  // 返回1表示成功，0表示失败
}