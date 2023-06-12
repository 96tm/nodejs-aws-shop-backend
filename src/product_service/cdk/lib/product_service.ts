import * as lambda from 'aws-cdk-lib/aws-lambda';

import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { ProductServiceProps } from './models/product_service_props';

import { initDynamoApi } from './init_dynamo_api';

import {
  PRODUCTS_TABLE_NAME,
  STOCKS_TABLE_NAME,
} from '../../../utils/constants';
import { initRdsApi } from './init_rds_api';

export const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION,
  },
};

export class ProductService extends Construct {
  constructor(scope: Construct, id: string, props: ProductServiceProps) {
    super(scope, id);

    const lambdaPropsDynamo = {
      ...sharedLambdaProps,
      environment: {
        ...sharedLambdaProps.environment,
        APP_PRODUCTS_TABLE_NAME: props.productsTable.tableName,
        APP_STOCKS_TABLE_NAME: props.stocksTable.tableName,
      },
    };

    const lambdaPropsRds = {
      ...sharedLambdaProps,
      securityGroups: props.rdsSecurityGroups,
      vpc: props.rdsVpc,
      allowPublicSubnet: true,
      environment: {
        ...sharedLambdaProps.environment,
        POSTGRES_HOST: props.rdsInstance.dbInstanceEndpointAddress,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_NAME: process.env.POSTGRES_NAME,
        POSTGRES_PORT: process.env.POSTGRES_PORT,
        APP_PRODUCTS_TABLE_NAME: PRODUCTS_TABLE_NAME,
        APP_STOCKS_TABLE_NAME: STOCKS_TABLE_NAME,
      },
      bundling: {
        externalModules: ['aws-sdk', 'pg-native'],
      },
    };

    initDynamoApi({
      lambdaProps: lambdaPropsDynamo,
      construct: this,
      props: props,
    });

    initRdsApi({
      lambdaProps: lambdaPropsRds,
      construct: this,
      props: props,
    });
  }
}
