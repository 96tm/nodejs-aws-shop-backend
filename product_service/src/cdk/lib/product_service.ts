import path from 'path';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

import { ProductServiceProps } from './models/product_service_props';

import {
  PRODUCTS_TABLE_NAME,
  STOCKS_TABLE_NAME,
  SHARED_LAMBDA_PROPS,
} from '../../utils/constants';
import { initRdsApi } from './init_rds_api';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Duration } from 'aws-cdk-lib';

export class ProductService extends Construct {
  constructor(scope: Construct, id: string, props: ProductServiceProps) {
    super(scope, id);

    const postgresParams = {
      POSTGRES_HOST: props.rdsInstance.dbInstanceEndpointAddress,
      POSTGRES_USER: process.env.POSTGRES_USER,
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
      POSTGRES_NAME: process.env.POSTGRES_NAME,
      POSTGRES_PORT: process.env.POSTGRES_PORT,
    };

    const lambdaPropsRds = {
      ...SHARED_LAMBDA_PROPS,
      securityGroups: props.rdsSecurityGroups,
      vpc: props.rdsVpc,
      allowPublicSubnet: true,
      environment: {
        ...SHARED_LAMBDA_PROPS.environment,
        ...postgresParams,
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

    const createProductTopic = new sns.Topic(this, 'CreateProductsTopic', {
      topicName: 'create-products-topic',
    });

    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      queueName: 'catalog-items-queue',
    });

    new sns.Subscription(this, 'BigStockSubscription', {
      endpoint: process.env.BIG_STOCK_EMAIL,
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: createProductTopic,
      filterPolicy: {
        count: sns.SubscriptionFilter.numericFilter({
          greaterThanOrEqualTo: parseInt(process.env.MAX_REGULAR_PRODUCT_COUNT),
        }),
      },
    });

    new sns.Subscription(this, 'RegularStockSubscription', {
      endpoint: process.env.REGULAR_STOCK_EMAIL,
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: createProductTopic,
      filterPolicy: {
        count: sns.SubscriptionFilter.numericFilter({
          lessThan: parseInt(process.env.MAX_REGULAR_PRODUCT_COUNT),
        }),
      },
    });

    const catalogBatchProcessLambdaProps = {
      ...SHARED_LAMBDA_PROPS,
      timeout: Duration.seconds(10),
      environment: {
        ...lambdaPropsRds.environment,
        CREATE_PRODUCTS_TOPIC_ARN: createProductTopic.topicArn,
      },
    };

    const catalogBatchProcessHandler = new NodejsFunction(
      this,
      'CatalogBatchProcessLambda',
      {
        ...catalogBatchProcessLambdaProps,
        functionName: 'catalogBatchProcess',
        entry: path.resolve(__dirname, 'handlers/rds/catalog_batch_process.ts'),
      }
    );

    createProductTopic.grantPublish(catalogBatchProcessHandler);
    catalogBatchProcessHandler.addEventSource(
      new SqsEventSource(catalogItemsQueue, { batchSize: 5 })
    );
  }
}
