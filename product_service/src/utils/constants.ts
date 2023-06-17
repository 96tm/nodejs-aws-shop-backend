import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Duration } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export const PRODUCTS_TABLE_NAME = 'products';
export const STOCKS_TABLE_NAME = 'stocks';

export const SHARED_LAMBDA_PROPS: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  memorySize: 1024,
  timeout: Duration.seconds(5),
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION,
  },
};
