import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ImportService } from './import_service';

import '../../utils/load_env';

export class ImportServiceStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string = 'ImportServiceStack',
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    new ImportService(this, 'ImportService');
  }
}
