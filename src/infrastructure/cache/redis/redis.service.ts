import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly memoryStore = new Map<string, string>();
  private client: Redis | null = null;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.SKIP_REDIS_CONNECT === 'true') {
      return;
    }

    const redisUrl = this.configService.getOrThrow<string>('redis.url');

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });

    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  async setex(key: string, ttlInSeconds: number, value: string): Promise<void> {
    if (!this.client) {
      this.memoryStore.set(key, value);

      return;
    }

    await this.client.setex(key, ttlInSeconds, value);
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      return this.memoryStore.get(key) ?? null;
    }

    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    if (!this.client) {
      this.memoryStore.delete(key);

      return;
    }

    await this.client.del(key);
  }

  async delByPrefix(prefix: string): Promise<void> {
    if (!this.client) {
      for (const key of this.memoryStore.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryStore.delete(key);
        }
      }

      return;
    }

    let cursor = '0';

    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        'MATCH',
        `${prefix}*`,
        'COUNT',
        '100',
      );

      if (keys.length > 0) {
        await this.client.del(...keys);
      }

      cursor = nextCursor;
    } while (cursor !== '0');
  }
}
