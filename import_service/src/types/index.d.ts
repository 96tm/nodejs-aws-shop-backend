declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PRODUCT_AWS_REGION: string;
    }
  }
}

export {};
