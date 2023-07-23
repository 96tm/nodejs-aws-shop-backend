type ServiceName = 'carts' | 'products';

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
