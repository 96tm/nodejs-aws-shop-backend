import path from 'path';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';

import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION,
  },
};

interface ProductServiceProps extends cdk.StackProps {
  productsTable: dynamodb.Table;
  stocksTable: dynamodb.Table;
}

export class ProductService extends Construct {
  constructor(scope: Construct, id: string, props: ProductServiceProps) {
    super(scope, id);

    const lambdaProps = {
      ...sharedLambdaProps,
      environment: {
        ...sharedLambdaProps.environment,
        APP_PRODUCTS_TABLE_NAME: props.productsTable.tableName,
        APP_STOCKS_TABLE_NAME: props.stocksTable.tableName,
      },
    };

    const getProductsListHandler = new NodejsFunction(
      this,
      'GetProductsListLambda',
      {
        ...lambdaProps,
        functionName: 'getProductsList',
        entry: path.resolve(__dirname, 'handlers/get_products_list.ts'),
      }
    );

    const getProductsByIdHandler = new NodejsFunction(
      this,
      'GetProductsByIdLambda',
      {
        ...lambdaProps,
        functionName: 'getProductsById',
        entry: path.resolve(__dirname, 'handlers/get_products_by_id.ts'),
      }
    );

    const api = new apiGateway.HttpApi(this, 'products-api', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    });
    api.addRoutes({
      integration: new HttpLambdaIntegration(
        'GetProductsListIntegration',
        getProductsListHandler
      ),
      path: '/products',
      methods: [apiGateway.HttpMethod.GET],
    });
    api.addRoutes({
      integration: new HttpLambdaIntegration(
        'GetProductsByIdIntegration',
        getProductsByIdHandler
      ),
      path: '/products/{productId}',
      methods: [apiGateway.HttpMethod.GET],
    });

    getProductsListHandler.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:Scan'],
        resources: [props.productsTable.tableArn, props.stocksTable.tableArn],
      })
    );
    getProductsByIdHandler.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:GetItem'],
        resources: [props.productsTable.tableArn, props.stocksTable.tableArn],
      })
    );
  }
}
