import path from 'path';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

import { ProductServiceProps } from './models/product_service_props';

export function initDynamoApi({
  lambdaProps,
  construct,
  props,
}: {
  lambdaProps: NodejsFunctionProps;
  construct: Construct;
  props: ProductServiceProps;
}): void {
  const getProductsListHandler = new NodejsFunction(
    construct,
    'GetProductsListLambdaDynamo',
    {
      ...lambdaProps,
      functionName: 'getProductsListDynamo',
      entry: path.resolve(__dirname, 'handlers/dynamo/get_products_list.ts'),
    }
  );

  const getProductsByIdHandler = new NodejsFunction(
    construct,
    'GetProductsByIdLambdaDynamo',
    {
      ...lambdaProps,
      functionName: 'getProductsByIdDynamo',
      entry: path.resolve(__dirname, 'handlers/dynamo/get_products_by_id.ts'),
    }
  );

  const createProductHandler = new NodejsFunction(
    construct,
    'CreateProductLambdaDynamo',
    {
      ...lambdaProps,
      functionName: 'createProductDynamo',
      entry: path.resolve(__dirname, 'handlers/dynamo/create_product.ts'),
    }
  );

  const api = new apiGateway.HttpApi(construct, 'products-api-dynamo', {
    corsPreflight: {
      allowHeaders: ['*'],
      allowOrigins: ['*'],
      allowMethods: [apiGateway.CorsHttpMethod.ANY],
    },
  });
  api.addRoutes({
    integration: new HttpLambdaIntegration(
      'GetProductsListIntegrationDynamo',
      getProductsListHandler
    ),
    path: '/products-dynamo',
    methods: [apiGateway.HttpMethod.GET],
  });
  api.addRoutes({
    integration: new HttpLambdaIntegration(
      'GetProductsByIdIntegrationDynamo',
      getProductsByIdHandler
    ),
    path: '/products-dynamo/{productId}',
    methods: [apiGateway.HttpMethod.GET],
  });
  api.addRoutes({
    integration: new HttpLambdaIntegration(
      'CreateProductIntegrationDynamo',
      createProductHandler
    ),
    path: '/products-dynamo',
    methods: [apiGateway.HttpMethod.POST],
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
  createProductHandler.addToRolePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:PutItem'],
      resources: [props.productsTable.tableArn, props.stocksTable.tableArn],
    })
  );
}
