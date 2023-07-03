import path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { SHARED_LAMBDA_PROPS } from '../../utils/constants';

export class AuthorizationService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new NodejsFunction(
      this,
      'BasicAuthorizerLambda',
      {
        ...SHARED_LAMBDA_PROPS,
        functionName: 'basicAuthorizer',
        entry: path.resolve(__dirname, 'handlers/basic_authorizer.ts'),
      }
    );
    // const importedLambdaFromArn = lambda.Function.fromFunctionArn(
    //   this,
    //   'external-lambda-from-arn',
    //   `arn:aws:lambda:${cdk.Stack.of(this).region}:${
    //     cdk.Stack.of(this).account
    //   }:function:YOUR_FUNCTION_NAME`,
    // );
  }
}
