import path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

import { SHARED_LAMBDA_PROPS } from '../../utils/constants';

export class ImportService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // const bucket = s3.Bucket.fromBucketName(
    //   this,
    //   'ImportBucket',
    //   'rs-aws-import-products-bucket'
    // );

    const bucket = new s3.Bucket(this, 'ImportBucket', {
      // objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // encryptionKey: new kms.Key(this, 's3BucketKMSKey'),
      bucketName: 'rs-aws-import-products-bucket',
    });

    const importLambdaProps = {
      ...SHARED_LAMBDA_PROPS,
      environment: {
        ...SHARED_LAMBDA_PROPS.environment,
        IMPORT_BUCKET_NAME: bucket.bucketName,
        IMPORT_BUCKET_ARN: bucket.bucketArn,
      },
    };

    const importProductsFileHandler = new NodejsFunction(
      this,
      'ImportFileLambda',
      {
        ...importLambdaProps,
        functionName: 'importProductsFile',
        entry: path.resolve(__dirname, 'handlers/import_products_file.ts'),
      }
    );

    bucket.grantReadWrite(importProductsFileHandler);
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
  }
}
