import { APIGatewayEvent, Context } from 'aws-lambda';

import { ProductWithStock } from '../../models/product_with_stock';
import {
  buildResponse,
  AppResponse,
  buildServerErrorResponse,
} from '../../../../../utils/utils';
import { Product } from '../../models/product';
import { getPgClient } from './utils';

async function getProductsWithStocks(): Promise<ProductWithStock[]> {
  const tableNameProducts = process.env.APP_PRODUCTS_TABLE_NAME as string;
  const tableNameStocks = process.env.APP_STOCKS_TABLE_NAME as string;

  const client = getPgClient();
  await client.connect();
  const { rows } = await client.query(
    `SELECT id, title, description, price, count FROM ${tableNameProducts} INNER JOIN ${tableNameStocks} ON id=product_id;`
  );
  await client.end();
  return rows as ProductWithStock[];
}

export async function handler(
  event: APIGatewayEvent,
  context: Context
): Promise<AppResponse> {
  console.log(event);
  try {
    context.callbackWaitsForEmptyEventLoop = false;
    const productsWithStocks = await getProductsWithStocks();
    const response = buildResponse<Product[]>(200, productsWithStocks);
    return response;
  } catch (err) {
    console.error(err);
    return buildServerErrorResponse();
  }
}
