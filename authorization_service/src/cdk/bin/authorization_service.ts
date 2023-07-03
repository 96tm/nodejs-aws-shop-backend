import * as cdk from 'aws-cdk-lib';
import { AuthorizationServiceStack } from '../lib/authorization_service_stack';

import '../../utils/load_env';

const app = new cdk.App();
new AuthorizationServiceStack(app, 'AuthorizationServiceStack', {
  env: { region: process.env.PRODUCT_AWS_REGION },
});

app.synth();
