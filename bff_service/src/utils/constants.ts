export type ServiceName = 'carts' | 'products';

export const RECIPIENTS: Record<ServiceName, string> = {
  carts: process.env.CART_SERVICE_API_URL,
  products: process.env.PRODUCT_SERVICE_API_URL,
};

export function isValidServiceName(
  serviceName: string
): serviceName is ServiceName {
  return ['carts', 'products'].includes(serviceName);
}

export const PORT: number = Number.parseInt(process.env.PORT) || 4000;
export const CACHE_TIMEOUT_MS: number =
  Number.parseInt(process.env.CACHE_TIMEOUT_SECONDS) * 1000;
export const CACHE_MAX_ITEMS: number =
  Number.parseInt(process.env.CACHE_MAX_ITEMS) || 1000;
