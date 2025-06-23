/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import cloneDeep from 'lodash.clonedeep';

interface CacheEntry {
  value: any;
  expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private readonly CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute
  private readonly DEFAULT_TTL_SECONDS = 300;
  private readonly NAMESPACE = 'app:'; // Can be customized or made dynamic

  onModuleInit() {
    this.logger.log('Starting cache cleanup job...');
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), this.CLEANUP_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private buildKey(key: string): string {
    return `${this.NAMESPACE}${key}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return entry.expiresAt < Date.now();
  }

  private cleanupExpired(): void {
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      this.logger.verbose(`Cleaned up ${removed} expired cache entries.`);
    }
  }

  async set<T = any>(key: string, value: T, ttlSeconds = this.DEFAULT_TTL_SECONDS): Promise<void> {
    if (!key || typeof key !== 'string') {
      this.logger.warn(`Invalid key used in cache: ${key}`);
      return;
    }

    const safeKey = this.buildKey(key);
    const expiresAt = Date.now() + ttlSeconds * 1000;

    try {
      const cloned = cloneDeep(value);
      this.cache.set(safeKey, { value: cloned, expiresAt });
    } catch (err: any) {
      this.logger.error(`Failed to set cache for key: ${key}`, err.stack);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const safeKey = this.buildKey(key);
    const entry = this.cache.get(safeKey);

    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(safeKey);
      return null;
    }

    try {
      return cloneDeep(entry.value) as T;
    } catch {
      return entry.value as T;
    }
  }

  async delete(key: string): Promise<boolean> {
    const safeKey = this.buildKey(key);
    return this.cache.delete(safeKey);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.logger.warn('Cache cleared manually.');
  }

  async has(key: string): Promise<boolean> {
    const safeKey = this.buildKey(key);
    const entry = this.cache.get(safeKey);
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(safeKey);
      return false;
    }
    return true;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  // Extendable for instrumentation or events
  // You can emit metrics to Prometheus or log spikes here
}
