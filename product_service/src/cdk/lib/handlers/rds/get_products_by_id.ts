import { ProductWithStock } from '../../models/product_with_stock';
import {
  buildResponse,
  AppResponse,
  ErrorData,
  buildServerErrorResponse,
} from '../../../../utils/utils';
import { LambdaEventDetail } from '../types';
import { getPgClient } from './utils';

async function getProductWithStocksById({
  productId,
}: {
  productId: string;
}): Promise<ProductWithStock | null> {
  const tableNameProducts = process.env.APP_PRODUCTS_TABLE_NAME as string;
  const tableNameStocks = process.env.APP_STOCKS_TABLE_NAME as string;
  const client = getPgClient();
  await client.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, title, description, price, count FROM ${tableNameProducts} INNER JOIN ${tableNameStocks} ON id=product_id WHERE id=$1;`,
      [productId]
    );
    return rows.length ? (rows[0] as ProductWithStock) : null;
  } catch (e) {
    console.error(e);
  }
  await client.end();
  return null;
}

export async function handler(event: LambdaEventDetail): Promise<AppResponse> {
  console.log(event);
  try {
    const { productId } = event.pathParameters;
    const productWithStock = await getProductWithStocksById({ productId });

    if (!productWithStock) {
      return buildResponse<ErrorData>(404, {
        error: {
          detail: 'Product not found',
        },
      });
    }

    return buildResponse<ProductWithStock>(200, productWithStock);
  } catch (err) {
    console.error(err);
    return buildServerErrorResponse();
  }
}
