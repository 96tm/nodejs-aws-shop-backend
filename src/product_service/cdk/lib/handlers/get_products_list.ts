import { buildResponse, AppResponse } from '../../../../utils/utils';
import { ErrorResponse } from '../models/response';
import { Product } from '../models/product';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { Stock } from '../models/stock';
import { ProductWithStock } from '../models/product_with_stock';

interface LambdaEvent {
  queryStringParameters?: Record<string, string>;
}

interface ProductsScanCommandOutput extends ScanCommandOutput {
  Items?: Product[] | undefined;
}

interface StocksScanCommandOutput extends ScanCommandOutput {
  Items?: Stock[] | undefined;
}

interface StocksHashMap {
  [key: string]: number;
}

async function getProducts({
  documentClient,
}: {
  documentClient: DynamoDBDocumentClient;
}): Promise<Product[]> {
  const tableNameProducts = process.env.APP_PRODUCTS_TABLE_NAME as string;
  const productsResult = await documentClient.send(
    new ScanCommand({
      TableName: tableNameProducts,
    })
  );
  let { Items: products } =
    productsResult as unknown as ProductsScanCommandOutput;
  return products || [];
}

async function getStocks({
  documentClient,
}: {
  documentClient: DynamoDBDocumentClient;
}): Promise<Stock[]> {
  const tableNameStocks = process.env.APP_STOCKS_TABLE_NAME as string;
  const stocksResult = await documentClient.send(
    new ScanCommand({
      TableName: tableNameStocks,
    })
  );
  let { Items: stocks } = stocksResult as unknown as StocksScanCommandOutput;
  return stocks || [];
}

export async function handler(event: LambdaEvent): Promise<AppResponse> {
  console.log(event);
  const client = new DynamoDBClient({});
  const dynamo = DynamoDBDocumentClient.from(client);
  try {
    const products = await getProducts({ documentClient: dynamo });
    const stocks = await getStocks({ documentClient: dynamo });
    const stocksHashMap = stocks.reduce<StocksHashMap>(
      (acc, cur) => ({
        ...acc,
        [cur.product_id]: cur.count,
      }),
      {}
    );
    const productsWithStocks: ProductWithStock[] = products.map((product) => ({
      ...product,
      count: stocksHashMap[product.id] || 0,
    }));
    const response = buildResponse<ProductWithStock[]>(200, productsWithStocks);
    return response;
  } catch (err) {
    console.error(err);
    return buildResponse<ErrorResponse>(500, {
      error: { detail: 'Internal Server Error' },
    });
  }
}
