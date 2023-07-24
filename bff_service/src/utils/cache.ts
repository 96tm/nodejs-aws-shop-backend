import { CACHE_MAX_ITEMS, CACHE_TIMEOUT_MS, ServiceName } from './constants';

interface ResponseData {
  status: number;
  json: Record<string, string>;
}

interface CacheValue {
  expiresAt: number;
  data: ResponseData;
  index: number;
}

export class ResponseCache {
  private caches: Record<ServiceName, Record<string, CacheValue | undefined>> =
    {
      products: {},
      carts: {},
    };
  private requestKeys: Record<ServiceName, string[]> = {
    products: [],
    carts: [],
  };

  private validateCacheRequest(
    service: ServiceName,
    requestUrl: string
  ): boolean {
    return service === 'products' && requestUrl.startsWith('GET_products');
  }

  get(service: ServiceName, requestUrl: string): ResponseData | null {
    const serviceCache = this.caches[service];
    const cached = serviceCache?.[requestUrl];
    if (cached && cached.expiresAt >= Date.now()) {
      return cached.data;
    } else if (cached) {
      this.requestKeys[service].splice(cached.index, 1);
      delete serviceCache[requestUrl];
    }
    return null;
  }

  set(service: ServiceName, requestUrl: string, data: ResponseData): void {
    if (!this.validateCacheRequest(service, requestUrl)) {
      return;
    }
    const serviceCache = this.caches[service];
    const serviceRequestKeys = this.requestKeys[service];
    const cachedValue = serviceCache[requestUrl];
    let cacheValueIndex = serviceRequestKeys.length;
    if (cachedValue) {
      cacheValueIndex = cachedValue.index;
    } else {
      serviceRequestKeys.push(requestUrl);
    }
    serviceCache[requestUrl] = {
      expiresAt: Date.now() + CACHE_TIMEOUT_MS,
      data,
      index: cacheValueIndex,
    };
    if (serviceRequestKeys.length >= CACHE_MAX_ITEMS) {
      const oldestRequestUrl = serviceRequestKeys[0];
      serviceRequestKeys.splice(0, 1);
      delete serviceCache[oldestRequestUrl];
    }
  }
}
