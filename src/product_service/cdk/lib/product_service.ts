import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path from 'path';
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

export class ProductService extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const getProductsListHandler = new NodejsFunction(
            this,
            'GetProductsListLambda',
            {
                ...sharedLambdaProps,
                functionName: 'getProductsList',
                entry: path.resolve(__dirname, 'handlers/get_products_list.ts'),
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
    }
}
