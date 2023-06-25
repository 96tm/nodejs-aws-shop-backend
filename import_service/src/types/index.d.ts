declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PRODUCT_AWS_REGION: string;
      REGULAR_STOCK_EMAIL: string;
      BIG_STOCK_EMAIL: string;
      MAX_REGULAR_PRODUCT_COUNT: string;
    }
  }
}

export {};
