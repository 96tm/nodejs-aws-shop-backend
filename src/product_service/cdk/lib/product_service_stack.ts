import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as productService from './product_service';

import '../../../utils/load_env';

export class ProductServiceStack extends cdk.Stack {
    constructor(
        scope: Construct,
        id: string = 'ProductServiceStack',
        props?: cdk.StackProps
    ) {
        super(scope, id, props);
        new productService.ProductService(this, 'ProductService');
    }
}
