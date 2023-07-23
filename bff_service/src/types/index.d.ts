declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT: string;
      CART_SERVICE_API_URL: string;
      PRODUCT_SERVICE_API_URL: string;
    }
  }
}

export {};
