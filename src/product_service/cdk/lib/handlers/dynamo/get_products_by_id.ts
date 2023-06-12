import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
} from '@aws-sdk/client-dynamodb';

import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { LambdaEventDetail } from '../types';
import { ProductItemDynamoDb } from '../../models/product_item_dynamodb';
import { StockItemDynamoDb } from '../../models/stock_item_dynamodb';
import { ProductWithStock } from '../../models/product_with_stock';
import {
  buildResponse,
  AppResponse,
  ErrorData,
  buildServerErrorResponse,
} from '../../../../../utils/utils';

interface StocksGetItemCommandOutput extends GetItemCommandOutput {
  Item?: StockItemDynamoDb;
}

interface ProductsGetItemCommandOutput extends GetItemCommandOutput {
  Item?: ProductItemDynamoDb;
}

async function getStockCountForProduct({
  documentClient,
  productId,
}: {
  documentClient: DynamoDBDocumentClient;
  productId: string;
}): Promise<number> {
  const tableNameStocks = process.env.APP_STOCKS_TABLE_NAME as string;
  const stocksResult = await documentClient.send(
    new GetItemCommand({
      TableName: tableNameStocks,
      Key: { product_id: { S: productId } },
    })
  );
  let { Item: stockItem } =
    stocksResult as unknown as StocksGetItemCommandOutput;
  if (!stockItem) {
    return 0;
  }
  return Number(stockItem.count.N) || 0;
}

export async function handler(event: LambdaEventDetail): Promise<AppResponse> {
  console.log(event);
  try {
    const tableNameProducts = process.env.APP_PRODUCTS_TABLE_NAME as string;
    const { productId } = event.pathParameters;
    const client = new DynamoDBClient({});
    const dynamo = DynamoDBDocumentClient.from(client);
    const productsResult = await dynamo.send(
      new GetItemCommand({
        TableName: tableNameProducts,
        Key: { id: { S: productId } },
      })
    );
    let { Item: productItem } =
      productsResult as unknown as ProductsGetItemCommandOutput;
    if (!productItem) {
      return buildResponse<ErrorData>(404, {
        error: {
          detail: 'Product not found',
        },
      });
    }
    const stockCount = await getStockCountForProduct({
      documentClient: dynamo,
      productId,
    });

    const productWithStock: ProductWithStock = {
      id: productItem.id.S,
      price: Number(productItem.price.N),
      title: productItem.title.S,
      description: productItem.description.S,
      count: stockCount,
    };
    return buildResponse<ProductWithStock>(200, productWithStock);
  } catch (err) {
    console.error(err);
    return buildServerErrorResponse();
  }
}
