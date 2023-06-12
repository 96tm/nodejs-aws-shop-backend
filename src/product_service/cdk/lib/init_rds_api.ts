import path from 'path';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { ProductServiceProps } from './models/product_service_props';

export function initRdsApi({
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
    'GetProductsListLambda',
    {
      ...lambdaProps,
      functionName: 'getProductsList',
      entry: path.resolve(__dirname, 'handlers/rds/get_products_list.ts'),
    }
  );

  const getProductsByIdHandler = new NodejsFunction(
    construct,
    'GetProductsByIdLambda',
    {
      ...lambdaProps,
      functionName: 'getProductsById',
      entry: path.resolve(__dirname, 'handlers/rds/get_products_by_id.ts'),
    }
  );

  const createProductHandler = new NodejsFunction(
    construct,
    'CreateProductLambda',
    {
      ...lambdaProps,
      functionName: 'createProduct',
      entry: path.resolve(__dirname, 'handlers/rds/create_product.ts'),
    }
  );

  const api = new apiGateway.HttpApi(construct, 'products-api', {
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
  api.addRoutes({
    integration: new HttpLambdaIntegration(
      'CreateProductIntegration',
      createProductHandler
    ),
    path: '/products',
    methods: [apiGateway.HttpMethod.POST],
  });
}
