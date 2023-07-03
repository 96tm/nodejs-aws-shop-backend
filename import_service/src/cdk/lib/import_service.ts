import path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import {
  HttpLambdaAuthorizer,
  HttpLambdaResponseType,
} from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { aws_s3_notifications } from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import {
  SHARED_LAMBDA_PROPS,
  IMPORT_BUCKET_UPLOAD_DIR,
  IMPORT_BUCKET_PARSED_DIR,
} from '../../utils/constants';

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

    const queue = sqs.Queue.fromQueueArn(
      this,
      'ImportFileQueue',
      process.env.IMPORT_QUEUE_ARN
    );

    const lambdaProps = {
      ...SHARED_LAMBDA_PROPS,
      environment: {
        ...SHARED_LAMBDA_PROPS.environment,
        IMPORT_BUCKET_NAME: bucket.bucketName,
        IMPORT_BUCKET_ARN: bucket.bucketArn,
        IMPORT_BUCKET_UPLOAD_DIR,
        IMPORT_BUCKET_PARSED_DIR,
        IMPORT_SQS_URL: queue.queueUrl,
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
    queue.grantSendMessages(importFileParserHandler);
    bucket.grantReadWrite(importProductsFileHandler);
    bucket.grantReadWrite(importFileParserHandler);
    bucket.grantDelete(importFileParserHandler);

    const api = new apiGateway.HttpApi(this, 'import-api', {
      description: 'ImportService HTTP API',
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    });

    const basicAuthorizerLambda = NodejsFunction.fromFunctionArn(
      this,
      'BasicAuthorizerLambda',
      process.env.BASIC_AUTHORIZER_LAMBDA_ARN
    );
    const basicAuthorizer = new HttpLambdaAuthorizer(
      'BasicHttpApiAuthorizer',
      basicAuthorizerLambda,
      {
        responseTypes: [HttpLambdaResponseType.SIMPLE],
      }
    );

    api.addRoutes({
      integration: new HttpLambdaIntegration(
        'ImportProductsFileIntegration',
        importProductsFileHandler
      ),
      path: '/import',
      methods: [apiGateway.HttpMethod.GET],
      authorizer: basicAuthorizer,
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(importFileParserHandler),
      { prefix: IMPORT_BUCKET_UPLOAD_DIR }
    );
  }
}
