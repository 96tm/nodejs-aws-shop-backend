import path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

import {
  SHARED_LAMBDA_PROPS,
  IMPORT_BUCKET_UPLOAD_DIR,
  IMPORT_BUCKET_PARSED_DIR,
} from '../../utils/constants';
import { aws_s3_notifications } from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class ImportService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucket = new s3.Bucket(this, 'ImportBucket', {
      bucketName: 'rs-aws-import-products-bucket',
      cors: [
        {
          allowedHeaders: ['*'],
          allowedOrigins: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
        },
      ],
    });

    const lambdaProps = {
      ...SHARED_LAMBDA_PROPS,
      environment: {
        ...SHARED_LAMBDA_PROPS.environment,
        IMPORT_BUCKET_NAME: bucket.bucketName,
        IMPORT_BUCKET_ARN: bucket.bucketArn,
        IMPORT_BUCKET_UPLOAD_DIR,
        IMPORT_BUCKET_PARSED_DIR,
      },
    };

    const importProductsFileHandler = new NodejsFunction(
      this,
      'ImportFileLambda',
      {
        ...lambdaProps,
        functionName: 'importProductsFile',
        entry: path.resolve(__dirname, 'handlers/import_products_file.ts'),
      }
    );

    const importFileParserHandler = new NodejsFunction(
      this,
      'ImportFileParserLambda',
      {
        ...lambdaProps,
        functionName: 'importFileParser',
        entry: path.resolve(__dirname, 'handlers/import_file_parser.ts'),
      }
    );

    bucket.grantReadWrite(importProductsFileHandler);
    bucket.grantReadWrite(importFileParserHandler);
    bucket.grantDelete(importFileParserHandler);

    const importProductsTopic = new sns.Topic(this, 'ImportProductsTopic', {
      topicName: 'import-products-topic',
    });

    const importQueue = new sqs.Queue(this, 'ImportQueue', {
      queueName: 'import-queue',
    });

    new sns.Subscription(this, 'BigStockSubscription', {
      endpoint: process.env.BIG_STOCK_EMAIL,
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: importProductsTopic,
      filterPolicy: {
        count: sns.SubscriptionFilter.numericFilter({
          greaterThanOrEqualTo: parseInt(process.env.MAX_REGULAR_PRODUCT_COUNT),
        }),
      },
    });

    new sns.Subscription(this, 'RegularStockSubscription', {
      endpoint: process.env.REGULAR_STOCK_EMAIL,
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: importProductsTopic,
      filterPolicy: {
        count: sns.SubscriptionFilter.numericFilter({
          lessThan: parseInt(process.env.MAX_REGULAR_PRODUCT_COUNT),
        }),
      },
    });

    const catalogBatchProcessHandler = new NodejsFunction(
      this,
      'CatalogBatchProcessLambda',
      {
        ...lambdaProps,
        environment: {
          ...lambdaProps.environment,
          IMPORT_PRODUCTS_TOPIC_ARN: importProductsTopic.topicArn,
        },
        functionName: 'catalogBatchProcess',
        entry: path.resolve(__dirname, 'handlers/catalog_batch_process.ts'),
      }
    );

    importProductsTopic.grantPublish(catalogBatchProcessHandler);
    catalogBatchProcessHandler.addEventSource(
      new SqsEventSource(importQueue, { batchSize: 5 })
    );

    const api = new apiGateway.HttpApi(this, 'import-api', {
      description: 'ImportService HTTP API',
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    });
    api.addRoutes({
      integration: new HttpLambdaIntegration(
        'ImportProductsFileIntegration',
        importProductsFileHandler
      ),
      path: '/import',
      methods: [apiGateway.HttpMethod.GET],
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(importFileParserHandler),
      { prefix: IMPORT_BUCKET_UPLOAD_DIR }
    );
  }
}
