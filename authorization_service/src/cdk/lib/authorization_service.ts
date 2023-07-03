import path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { SHARED_LAMBDA_PROPS } from '../../utils/constants';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class AuthorizationService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const lambdaProps = {
      ...SHARED_LAMBDA_PROPS,
      environment: {
        ...SHARED_LAMBDA_PROPS.environment,
        AUTH_USER: process.env.AUTH_USER,
        AUTH_PASSWORD: process.env.AUTH_PASSWORD,
      },
    };
    const basicAuthorizerLambda = new NodejsFunction(
      this,
      'BasicAuthorizerLambda',
      {
        ...lambdaProps,
        functionName: 'basicAuthorizer',
        entry: path.resolve(__dirname, 'handlers/basic_authorizer.ts'),
      }
    );
    basicAuthorizerLambda.grantInvoke(
      new ServicePrincipal('apigateway.amazonaws.com')
    );
  }
}
