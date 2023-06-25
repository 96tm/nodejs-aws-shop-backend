import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Duration } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import '../utils/load_env';

export const SHARED_LAMBDA_PROPS: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  memorySize: 1024,
  timeout: Duration.seconds(5),
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION,
  },
};

export const IMPORT_BUCKET_PARSED_DIR = 'parsed';
export const IMPORT_BUCKET_UPLOAD_DIR = 'uploaded';
