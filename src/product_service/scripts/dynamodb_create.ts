import {
  DynamoDBClient,
  CreateTableCommand,
  ResourceInUseException,
} from '@aws-sdk/client-dynamodb';

import '../../utils/load_env';

async function createProductsTable({
  client,
}: {
  client: DynamoDBClient;
}): Promise<void> {
  const tableName = 'products';
  try {
    const createProductsTableCommand = new CreateTableCommand({
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S',
        },
      ],
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });
    const result = await client.send(createProductsTableCommand);
    console.log(result);
  } catch (err) {
    if (err instanceof ResourceInUseException) {
      console.info(`Table ${tableName} already exists`);
    } else {
      console.error(err);
    }
  }
}

async function createStocksTable({
  client,
}: {
  client: DynamoDBClient;
}): Promise<void> {
  const tableName = 'stocks';
  try {
    const createStocksTableCommand = new CreateTableCommand({
      AttributeDefinitions: [
        {
          AttributeName: 'product_id',
          AttributeType: 'S',
        },
      ],
      TableName: 'stocks',
      KeySchema: [
        {
          AttributeName: 'product_id',
          KeyType: 'HASH',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });
    const result = await client.send(createStocksTableCommand);
    console.log(result);
  } catch (err) {
    if (err instanceof ResourceInUseException) {
      console.info(`Table ${tableName} already exists`);
    } else {
      console.error(err);
    }
  }
}

(async () => {
  const client = new DynamoDBClient({ region: process.env.PRODUCT_AWS_REGION });
  await createProductsTable({ client });
  await createStocksTable({ client });
})();
