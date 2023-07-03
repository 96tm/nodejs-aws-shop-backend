declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PRODUCT_AWS_REGION: string;
      AUTH_USER: string;
      AUTH_PASSWORD: string;
    }
  }
}

export {};
