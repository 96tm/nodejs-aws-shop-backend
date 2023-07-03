import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthorizationService } from './authorization_service';

import '../../utils/load_env';

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string = 'AuthorizationServiceStack',
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    new AuthorizationService(this, 'AuthorizationService');
  }
}
