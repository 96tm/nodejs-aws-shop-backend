import * as cdk from 'aws-cdk-lib';
import { ImportServiceStack } from '../lib/import_service_stack';

import '../../utils/load_env';

const app = new cdk.App();
new ImportServiceStack(app, 'ImportServiceStack', {
  env: { region: process.env.PRODUCT_AWS_REGION },
});

app.synth();
