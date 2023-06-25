import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as productService from './product_service';
import { DynamoDbConstruct } from './dynamodb';

import '../../utils/load_env';
import { RdsConstruct } from './rds';

export class ProductServiceStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string = 'ProductServiceStack',
    props?: cdk.StackProps
  ) {
    super(scope, id, props);
    const dynamoDbConstruct = new DynamoDbConstruct(this);
    const rdsConstruct = new RdsConstruct(this);

    new productService.ProductService(this, 'ProductService', {
      productsTable: dynamoDbConstruct.productsTable,
      stocksTable: dynamoDbConstruct.stocksTable,
      rdsInstance: rdsConstruct.dbInstance,
      rdsSecurityGroups: rdsConstruct.dbSecurityGroups,
      rdsVpc: rdsConstruct.dbVpc,
    });
  }
}
