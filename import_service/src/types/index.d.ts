declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PRODUCT_AWS_REGION: string;
      IMPORT_QUEUE_ARN: string;
      IMPORT_QUEUE_MESSAGE_GROUP_ID: string;
    }
  }
}

export {};
