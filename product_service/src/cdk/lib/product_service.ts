import { OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { ProductServiceProps } from './models/product_service_props';

import {
  PRODUCTS_TABLE_NAME,
  STOCKS_TABLE_NAME,
  SHARED_LAMBDA_PROPS,
} from '../../utils/constants';
import { initRdsApi } from './init_rds_api';

export class ProductService extends Construct {
  constructor(scope: Construct, id: string, props: ProductServiceProps) {
    super(scope, id);

    const lambdaPropsRds = {
      ...SHARED_LAMBDA_PROPS,
      securityGroups: props.rdsSecurityGroups,
      vpc: props.rdsVpc,
      allowPublicSubnet: true,
      environment: {
        ...SHARED_LAMBDA_PROPS.environment,
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

    initRdsApi({
      lambdaProps: lambdaPropsRds,
      construct: this,
    });
  }
}
