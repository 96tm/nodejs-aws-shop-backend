declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PRODUCT_AWS_REGION: string;
      IMPORT_QUEUE_ARN: string;
      BASIC_AUTHORIZER_LAMBDA_ARN: string;
    }
  }
}

export {};
