import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import '../../utils/load_env';

export class DynamoDbConstruct extends Construct {
  readonly productsTable: dynamodb.Table;
  readonly stocksTable: dynamodb.Table;

  constructor(scope: Construct, id: string = 'DynamoDbConstruct') {
    super(scope, id);
    this.productsTable = new dynamodb.Table(this, 'ProductsDynamoDbTable', {
      tableName: 'products',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.stocksTable = new dynamodb.Table(this, 'StocksDynamoDbTable', {
      tableName: 'stocks',
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}
