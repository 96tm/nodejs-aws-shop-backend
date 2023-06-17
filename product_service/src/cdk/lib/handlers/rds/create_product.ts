import { randomUUID } from 'crypto';

import { APIGatewayEvent } from 'aws-lambda';

import {
  buildResponse,
  AppResponse,
  buildServerErrorResponse,
} from '../../../../utils/utils';

import { ProductWithStock } from '../../models/product_with_stock';
import { BadRequestError } from '../../models/errors';
import { CreateProductRequest, CreateProductResponse } from '../types';
import { parseCreateProductRequestBody } from '../validation';
import { getPgClient } from './utils';

async function createProduct({
  productData,
}: {
  productData: CreateProductRequest;
}): Promise<string> {
  const tableNameProducts = process.env.APP_PRODUCTS_TABLE_NAME as string;
  const tableNameStocks = process.env.APP_STOCKS_TABLE_NAME as string;
  const client = getPgClient();
  const productId = randomUUID();
  const productAttributes = productData.data.attributes;
  await client.connect();
  const insertProductQuery = `
    INSERT INTO ${tableNameProducts}(id, title, description, price)
    VALUES ($1, $2, $3, $4);
  `;
  const insertStockQuery = `
    INSERT INTO ${tableNameStocks}(product_id, count)
    VALUES ($1, $2);
  `;
  try {
    await client.query('BEGIN');
    await client.query(`${insertProductQuery}`, [
      productId,
      productAttributes.title,
      productAttributes.description,
      productAttributes.price,
    ]);
    await client.query(`${insertStockQuery}`, [
      productId,
      productAttributes.count,
    ]);
    await client.query('COMMIT');
    return productId;
  } catch (e) {
    client.query('ROLLBACK');
    throw e;
  } finally {
    await client.end();
  }
}

export async function handler(event: APIGatewayEvent): Promise<AppResponse> {
  console.log(event);
  try {
    const body = parseCreateProductRequestBody({ body: event.body });
    const {
      data: {
        attributes: { count, price, title, description },
      },
    } = body;

    const productId = await createProduct({
      productData: body,
    });

    const productWithStock: ProductWithStock = {
      id: productId,
      price: Number(price),
      title: title,
      description: description,
      count: parseInt(count),
    };
    const response: CreateProductResponse = {
      data: productWithStock,
    };
    return buildResponse<CreateProductResponse>(201, response);
  } catch (err) {
    console.error(err);
    if (err instanceof BadRequestError) {
      return buildResponse(err.statusCode, { error: { detail: err.message } });
    }
    return buildServerErrorResponse();
  }
}
