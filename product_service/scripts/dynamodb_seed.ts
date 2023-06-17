import {
  DynamoDBClient,
  BatchWriteItemCommand,
} from '@aws-sdk/client-dynamodb';

import { mockProducts } from '../src/cdk/lib/mocks/products';
import { mockStocks } from '../src/cdk/lib/mocks/stocks';

import '../src/utils/load_env';

async function seedProductsTable({ client }: { client: DynamoDBClient }) {
  const requestItems = mockProducts.map((item) => ({
    PutRequest: {
      Item: {
        id: {
          S: item.id,
        },
        price: {
          N: item.price.toString(),
        },
        title: {
          S: item.title,
        },
        description: {
          S: item.description,
        },
      },
    },
  }));
  const command = new BatchWriteItemCommand({
    RequestItems: { products: requestItems },
  });
  try {
    const result = await client.send(command);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

async function seedStocksTable({ client }: { client: DynamoDBClient }) {
  const requestItems = mockStocks.map((item) => ({
    PutRequest: {
      Item: {
        product_id: {
          S: item.product_id,
        },
        count: {
          N: item.count.toString(),
        },
      },
    },
  }));
  const command = new BatchWriteItemCommand({
    RequestItems: { stocks: requestItems },
  });
  try {
    const result = await client.send(command);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

(async () => {
  const client = new DynamoDBClient({ region: process.env.PRODUCT_AWS_REGION });
  await seedProductsTable({ client });
  await seedStocksTable({ client });
})();
