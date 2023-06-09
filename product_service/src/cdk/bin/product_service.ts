import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product_service_stack';

import '../../utils/load_env';

const app = new cdk.App();
new ProductServiceStack(app, 'ProductServiceStack', {
  env: { region: process.env.PRODUCT_AWS_REGION },
});
