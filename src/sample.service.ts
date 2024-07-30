import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class SampleService {
  constructor(@Inject(CACHE_MANAGER) private readonly cachemanager: Cache) {}

  async save(test: string) {
    await this.cachemanager.set('test', test);
    return true;
  }

  async find() {
    const test = await this.cachemanager.get('test');
    return test;
  }
}
